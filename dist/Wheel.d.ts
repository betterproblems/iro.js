import { h } from 'preact';
import { IroColor, IroColorPickerOptions } from '@irojs/iro-core';
import { IroComponentProps } from './ComponentBase';
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
export declare function getWheelHandlePosition(props: Partial<WheelProps>, color: IroColor): {
    x: number;
    y: number;
};
export declare function IroWheel(props: IroWheelProps): h.JSX.Element;
export {};
