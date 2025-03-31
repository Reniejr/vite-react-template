import React from 'react';

// Styles
import styles from './Buttons.module.scss';
import { generateClassesNames } from '../../../styles/utilities';

export const Button = ({ children, ...props }) => {

    const elements = [ "btn" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    return (
        <button
            className={classes_names["btn"]}
            { ...props }
        >
            { children }
        </button>
    );
};

export const ButtonIcon = ({ children, ...props }) => {

    const elements = [ "btn", "btn-icon", "vr", "hr" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    const dir = props.direction || "hr"

    return (
        <button
            className={`${classes_names["btn"]} ${classes_names["btn-icon"]} ${ classes_names[dir] }`}
            { ...props  }
        >
            { children }
        </button>
    )

}
    