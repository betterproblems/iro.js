import { h } from 'preact';
import {
  IroColor,
  resolveSvgUrl,
  getSvgArcPath,
  translateWheelAngle,
  getWheelDimensions,
  getWheelValueFromInput,
  getHandleAtPoint,
  IroColorPickerOptions,
} from '@irojs/iro-core';

import { IroComponentBase, IroComponentProps, IroInputType } from './ComponentBase';
import { IroHandle } from './Handle';

const HUE_STEPS = Array.apply(null, {length: 360}).map((_, index) => index);

interface IroWheelProps extends IroComponentProps {
  colors: IroColor[];
}

export interface WheelProps extends IroColorPickerOptions {
  color: IroColor;
}

/**
 * @desc Get the current handle position for a given color
 * @param props - wheel props
 * @param color
 */
export function getWheelHandlePosition(props: Partial<WheelProps>, color: IroColor) {
  const hsl = color.hsl;
  const { cx, cy } = getWheelDimensions(props);
  const handleRange = props.width / 2 - props.padding - props.handleRadius - props.borderWidth;
  const handleAngle = (180 + translateWheelAngle(props, hsl.h, true)) * (Math.PI / 180);
  const handleDist = (hsl.s / 100) * handleRange;
  const direction = props.wheelDirection === 'clockwise' ? -1 : 1;
  return {
    x: cx + handleDist * Math.cos(handleAngle) * direction,
    y: cy + handleDist * Math.sin(handleAngle) * direction,
  }
}

export function IroWheel(props: IroWheelProps) {

  const { width, radius, cx, cy } = getWheelDimensions(props);
  const { colors, borderWidth } = props;

  const colorPicker = props.parent;
  const activeColor = props.color;
  const hsl = activeColor.hsl;
  const handlePositions = colors.map(color => getWheelHandlePosition(props, color));

  function handleInput(x: number, y: number, inputType: IroInputType) {
    if (inputType === IroInputType.Start) {
      // getHandleAtPoint() returns the index for the handle if the point 'hits' it, or null otherwise
      const activeHandle = getHandleAtPoint(props, x, y, handlePositions);
      // If the input hit a handle, set it as the active handle, but don't update the color
      if (activeHandle !== null) {
        colorPicker.setActiveColor(activeHandle);
      }
      // If the input didn't hit a handle, set the currently active handle to that position
      else {
        colorPicker.inputActive = true;
        activeColor.hsl = {...getWheelValueFromInput(props, x, y), l: hsl.l};
        props.onInput(inputType);
      }
    }
    // move is fired when the user has started dragging
    else if (inputType === IroInputType.Move) {
      colorPicker.inputActive = true;
      activeColor.hsl = {...getWheelValueFromInput(props, x, y), l: hsl.l};
    }
    // let the color picker fire input:start, input:move or input:end events
    props.onInput(inputType);
  }

  return (
    <IroComponentBase {...props} onInput={ handleInput }>
      {(uid, rootProps, rootStyles) => (
        <svg
          { ...rootProps }
          className="IroWheel"
          width={ width }
          height={ width }
          style={ rootStyles }
        >
         <defs>
           <radialGradient id={ uid }>
             <stop offset="0%" stop-color="#808080"/>
             <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
           </radialGradient>
         </defs>
         <g className="IroWheelHue" stroke-width={ radius } fill="none">
           { HUE_STEPS.map(angle => (
             <path
               key={ angle }
               d={ getSvgArcPath(cx, cy, radius / 2, angle, angle + 1.5) }
               stroke={ `hsl(${translateWheelAngle(props, angle)}, 100%, 50%)` }
             />
           ))}
         </g>
         <circle
           className="IroWheelSaturation"
           cx={ cx }
           cy={ cy }
           r={ radius }
           fill={ `url(${resolveSvgUrl('#' + uid)})` }
         />
         { props.wheelLightness && (
           <circle
             className="IroWheelLightness"
             cx={ cx }
             cy={ cy }
             r={ radius }
             fill="#000"
             opacity={ 1 - hsl.l / 100 }
           />
         )}
         <circle
           className="IroWheelBorder"
           cx={ cx }
           cy={ cy }
           r={ radius }
           fill="none"
           stroke={ props.borderColor }
           stroke-width={ borderWidth }
         />
         { colors.filter(color => color !== activeColor).map(color => (
           <IroHandle
              isActive={ false }
              index={ color.index }
              fill={ color.hslString }
              r={ props.handleRadius }
              url={ props.handleSvg }
              props={ props.handleProps }
              x={ handlePositions[color.index].x }
              y={ handlePositions[color.index].y }
            />
         ))}
         <IroHandle
            isActive={ true }
            index={ activeColor.index }
            fill={ activeColor.hslString }
            r={ props.handleRadius }
            url={ props.handleSvg }
            props={ props.handleProps }
            x={ handlePositions[activeColor.index].x }
            y={ handlePositions[activeColor.index].y }
          />
       </svg>
      )}
    </IroComponentBase>
  );
}
