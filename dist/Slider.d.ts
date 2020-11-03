import { h } from 'preact';
import { IroColor, SliderShape, SliderType, SliderOptions } from '@irojs/iro-core';
import { IroComponentProps } from './ComponentBase';
interface IroSliderProps extends IroComponentProps {
    sliderType: SliderType;
    sliderShape: SliderShape;
    minTemperature: number;
    maxTemperature: number;
}
/**
 * @desc Get the gradient stops for a slider
 * @param props - slider props
 * @param color
 */
export declare function getSliderGradient(props: Partial<SliderOptions>, color: IroColor): any[];
/**
 * @desc Get the current slider value for a given color, as a percentage
 * @param props - slider props
 * @param color
 */
export declare function getCurrentSliderValue(props: Partial<SliderOptions>, color: IroColor): number;
/**
 * @desc Get the current handle position for a given color
 * @param props - slider props
 * @param color
 */
export declare function getSliderHandlePosition(props: Partial<SliderOptions>, color: IroColor): {
    x: number;
    y: number;
};
export declare function IroSlider(props: IroSliderProps): h.JSX.Element;
export declare namespace IroSlider {
    var defaultProps: {
        sliderShape: string;
        sliderType: string;
        minTemperature: number;
        maxTemperature: number;
    };
}
export {};
