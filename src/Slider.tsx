import { h } from 'preact';
import {
  IroColor,
  SliderShape,
  SliderType,
  sliderDefaultOptions,
  resolveSvgUrl,
  getSliderDimensions,
  getSliderValueFromInput,
  getSliderGradientCoords,
  SliderOptions,
} from '@irojs/iro-core';

import { IroComponentBase, IroComponentProps, IroInputType } from './ComponentBase';
import { IroHandle } from './Handle';

interface IroSliderProps extends IroComponentProps {
  sliderType: SliderType;
  sliderShape: SliderShape;
  minTemperature: number;
  maxTemperature: number;
};
/**
 * @desc Get the gradient stops for a slider
 * @param props - slider props
 * @param color
 */
export function getSliderGradient(props: Partial<SliderOptions>, color: IroColor) {
  const hsv = color.hsv;
  const rgb = color.rgb;

  switch (props.sliderType) {
    case 'red':
      return [
        [0, `rgb(${ 0 },${ rgb.g },${ rgb.b })`],
        [100, `rgb(${ 255 },${ rgb.g },${ rgb.b })`],
      ];
    case 'green':
      return [
        [0, `rgb(${ rgb.r },${ 0 },${ rgb.b })`],
        [100, `rgb(${ rgb.r },${ 255 },${ rgb.b })`],
      ];
    case 'blue':
      return [
        [0, `rgb(${ rgb.r },${ rgb.g },${ 0 })`],
        [100, `rgb(${ rgb.r },${ rgb.g },${ 255 })`],
      ];
    case 'alpha':
      return [
        [0, `rgba(${ rgb.r },${ rgb.g },${ rgb.b },0)`],
        [100, `rgb(${ rgb.r },${ rgb.g },${ rgb.b })`],
      ];
    case 'kelvin':
      const stops = [];
      const min = props.minTemperature;
      const max = props.maxTemperature;
      const numStops = 8;
      const range = max - min;
      for (let kelvin = min, stop = 0; kelvin < max; kelvin += range / numStops, stop += 1) {
        const { r, g, b } = IroColor.kelvinToRgb(kelvin);
        stops.push([ 100 / numStops * stop, `rgb(${r},${g},${b})` ]);
      }
      return stops;
    case 'hue':
      return [
        [0,      '#f00'],
        [16.666, '#ff0'],
        [33.333, '#0f0'],
        [50,     '#0ff'],
        [66.666, '#00f'],
        [83.333, '#f0f'],
        [100,    '#f00'],
      ];
    case 'saturation':
      const noSat = {h: color.hsl.h, s: 0, l: color.hsl.l};
      const fullSat = {h: color.hsl.h, s: 100, l: color.hsl.l};
      return [
        [0, `hsl(${noSat.h},${noSat.s}%,${noSat.l}%)`],
        [100, `hsl(${fullSat.h},${fullSat.s}%,${fullSat.l}%)`]
      ];
    case 'value':
    default:
      const hsl = IroColor.hsvToHsl({h: hsv.h, s: hsv.s, v: 100});
      return [
        [0, '#000'],
        [100, `hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`]
      ];
  }
}


/**
 * @desc Get the current slider value for a given color, as a percentage
 * @param props - slider props
 * @param color
 */
export function getCurrentSliderValue(props: Partial<SliderOptions>, color: IroColor) {
  const hsva = color.hsva;
  const rgb = color.rgb;
  const hsl = color.hsl;

  switch (props.sliderType) {
    case 'red':
      return rgb.r / 2.55;
    case 'green':
      return rgb.g / 2.55;
    case 'blue':
      return rgb.b / 2.55;
    case 'alpha':
      return hsva.a * 100;
    case 'kelvin':
      const { minTemperature, maxTemperature } = props;
      const temperatureRange = maxTemperature - minTemperature;
      const percent = ((color.kelvin - minTemperature) / temperatureRange) * 100;
      // clmap percentage
      return Math.max(0, Math.min(percent, 100));
    case 'hue':
      return hsva.h /= 3.6;
    case 'saturation':
      return hsl.s;
    case 'value':
    default:
      return hsva.v;
  }
}


/**
 * @desc Get the current handle position for a given color
 * @param props - slider props
 * @param color
 */
export function getSliderHandlePosition(props: Partial<SliderOptions>, color: IroColor) {
  const { width, height, handleRange, handleStart } = getSliderDimensions(props);
  const ishorizontal = props.layoutDirection === 'horizontal';
  const sliderValue = getCurrentSliderValue(props, color);
  const midPoint = ishorizontal ? width / 2 : height / 2;
  let handlePos = handleStart + (sliderValue / 100) * handleRange;
  if (ishorizontal) {
    handlePos = -1 * handlePos + handleRange + handleStart * 2;
  }
  return {x: ishorizontal ? midPoint : handlePos, y: ishorizontal ? handlePos : midPoint};
}


export function IroSlider(props: IroSliderProps) {
  const activeIndex = props.activeIndex;
  const activeColor = (activeIndex !== undefined && activeIndex < props.colors.length) ? props.colors[activeIndex] : props.color;
  const { width, height, radius } = getSliderDimensions(props);
  const handlePos = getSliderHandlePosition(props, activeColor);
  const gradient = getSliderGradient(props, activeColor);
  const isAlpha = props.sliderType === 'alpha';

  function handleInput(x: number, y: number, type: IroInputType) {
    const value = getSliderValueFromInput(props, x, y);
    props.parent.inputActive = true;
    const hsl = activeColor.hsl;

    if (props.sliderType === "saturation") {
      activeColor.hsl = {h: hsl.h, s: value, l: hsl.l};
    } else {
      activeColor[props.sliderType] =  value;
    }

    props.onInput(type);
  }

  return (
    <IroComponentBase {...props} onInput={ handleInput }>
      {(uid, rootProps, rootStyles) => (
        <svg
          { ...rootProps }
          className="IroSlider"
          width={ width }
          height={ height }
          style= { rootStyles }
        >
          <defs>
            <linearGradient id={ 'g' + uid } {...getSliderGradientCoords(props)}>
              { gradient.map(([ offset, color ]) => (
                <stop offset={`${ offset }%`} stop-color={ color } />
              ))}
            </linearGradient>
            { isAlpha && (
              <pattern id={ 'b' + uid } width="8" height="8" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="8" height="8" fill="#fff"/>
                <rect x="0" y="0" width="4" height="4" fill="#ccc"/>
                <rect x="4" y="4" width="4" height="4" fill="#ccc"/>
              </pattern>
            )}
            { isAlpha && (
              <pattern id={ 'f' + uid } width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill={`url(${resolveSvgUrl( '#b' + uid )})`}></rect>
                <rect x="0" y="0" width="100%" height="100%" fill={`url(${resolveSvgUrl( '#g' + uid )})`}></rect>
              </pattern>
            )}
          </defs>
          <rect
            className="IroSliderBg"
            rx={ radius }
            ry={ radius }
            x={ props.borderWidth / 2 }
            y={ props.borderWidth / 2 }
            width={ width - props.borderWidth }
            height={ height - props.borderWidth }
            stroke-width={ props.borderWidth }
            stroke={ props.borderColor }
            fill={ `url(${resolveSvgUrl( (isAlpha ? '#f' : '#g') + uid )})` }
          />
          <IroHandle
            isActive={ true }
            index={ activeColor.index }
            r={ props.handleRadius }
            url={ props.handleSvg }
            props={ props.handleProps }
            x={ handlePos.x }
            y={ handlePos.y }
          />
        </svg>
      )}
    </IroComponentBase>
  );
}

IroSlider.defaultProps = {
  ...sliderDefaultOptions
};
