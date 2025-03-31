/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { Fragment } from 'react';

// Styles
import styles from './Loaders.module.scss';
import { generateClassesNames } from '../../../styles/utilities';

// million-ignore
export const Loader = ({ loaderState, children, ...props }) => {

    const elements = ["loader-screen", "loader-container", "loader", "loader-text", "fixed", "relative" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    const { icon, ...rest } = props;

    const variant = props.variant || "fixed"

    return (
        <Fragment>
            {
                !loaderState[0].isActive ? null :
                <div
                    className={`${classes_names['loader-screen']} ${classes_names[variant]}`}
                    { ...rest }
                >
                    <div className={classes_names["loader-container"]}>
                        <div className={classes_names["loader"]}>
                            { icon !== undefined && icon !== null && icon }
                            <p className={classes_names["loader-text"]}>{loaderState[0].message}</p>
                            { children }
                        </div>
                    </div>
                </div>
            }
        </Fragment>
    );
};
    