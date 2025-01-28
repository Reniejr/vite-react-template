/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types  */
import React, { forwardRef, useState, Fragment } from 'react';

// Components
import PhoneInput from'react-phone-number-input';

// Styles
import styles from './Inputs.module.scss';
import { generateClassesNames } from '../../../styles/utilities';
import 'react-phone-number-input/style.css'

export const InputContainer = ({ children, ...props }) => {

    const elements = ["input-container"];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    return(
        <div className={classes_names["input-container"]}>
            { children }
        </div>
    )

}

export const InputLabel = ({ children, ...props }) => {

    const elements = ["input-label"];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    return(
        <label className={classes_names["input-label"]} htmlFor={props.id}>
            { children }
        </label>
    )

}

export const InputText = forwardRef( ( props, ref ) => {

    const elements = [ "input" , "input-text" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    return (
        <input 
            className={`${classes_names['input']} ${classes_names['input-text']}`}
            type="text"
            { ...props }
            ref={ref} 
        />
    );

});
InputText.displayName = "InputText";

export const InputEmail = forwardRef( ( props, ref ) => {

    const elements = [ "input" , "input-email" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    return (
        <input 
            className={`${classes_names['input']} ${classes_names['input-email']}`}
            type="email"
            { ...props }
            ref={ref}
        />
    );

});
InputEmail.displayName = "InputEmail";

export const InputPassword = forwardRef( ( props, ref ) => {

    const { icon, ...rest } = props;

    const elements = [ "input" , "input-password-container", "input-password", "show-hide-icon" ];
    const classes_names = generateClassesNames(elements, styles, rest.additionalStyles);


    // States
    const [ { showPassword }, setShowPassword ] = useState({ showPassword: false });

    function triggerShowPassword() {
        setShowPassword({ showPassword: !showPassword});
    }

    return (
        <div className={classes_names["input-password-container"]}>
            <input 
                className={`${classes_names['input']} ${classes_names['input-password']}`}
                type={ showPassword ? "text" : "password"}
                { ...rest }
                ref={ref} 
            />
            { !icon && <ion-icon 
                onClick={triggerShowPassword} 
                name={`eye-${ showPassword ? "off-" : "" }outline`} 
                className={`${classes_names["show-hide-icon"]}`}
                ></ion-icon> 
            }
        </div>
    )

});
InputPassword.displayName = "InputPassword";

export const InputLink = forwardRef( ( props, ref ) => {

    const elements = [ "input" , "input-link" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    return <input 
        type="url" 
        className={`${classes_names["input"]} ${classes_names["input-link"]}`} 
        { ...props }
        ref={ref}
    />

});
InputLink.displayName = "InputLink";

export const InputPhone = forwardRef( ( props, ref ) => {

    const elements = [ "input" , "input-phone" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    function handleChange(e){

        if(props.onChange) {
            let html_event = {};
            html_event["current"] = {
                target: {
                    value: e
                }
            }
            html_event["currentTarget"] = {
                value: e
            }
            html_event["value"] = e
            props.onChange(html_event);
        }

    }

    return <PhoneInput 
        className={`${classes_names['input']} ${classes_names['input-phone']}`} 
        { ...props }
        ref={ref}
        onChange={handleChange}
    />

});
InputPhone.displayName = "InputPhone";

export const InputFile = forwardRef( ( props, ref ) => {

    const { label, ...rest } = props;

    const elements = [ "input", "input-file", "input-file-container", "input-file-area-trigger", "remove-file", "input-file-label" ]
    const classes_names = generateClassesNames(elements, styles, rest.additionalStyles);

    const [ { isFileAdded }, setIsFileAdded ] = useState({ isFileAdded: false });


    function handleFileChange(e) {

        if(e.target.files.length > 0){
            setIsFileAdded({ isFileAdded: true });
            const files = e.target.files;
            handleInputPlaceholder();
            rest.onChange(files);
        }

    }

    function removeFile(){
        if(ref && ref.current) {
            setIsFileAdded({
                isFile: false
            })
            ref.current.value = "";
            handleInputPlaceholder();
        } else {
            console.error("Input file ref is not available.");
        }
    }

    const [ { filePlaceholder }, setFilePlaceholder ] = useState({ filePlaceholder: [label] }) 

    function handleInputPlaceholder(){

        if(ref && ref.current){
            if(ref.current.files.length > 0){
                setFilePlaceholder({ filePlaceholder: Object.values(ref.current.files).map(f => f.name)});
            } else {
                setFilePlaceholder({ filePlaceholder: [ label ]});
            }
        } else {
            console.error("Input file ref is not available.");
        }

    }

    return <div className={classes_names["input-file-container"]}>
        <label htmlFor={rest.id} className={classes_names['input-file-area-trigger']}>
            <input 
                type="file"
                id={rest.id}
                className={`${classes_names['input']} ${classes_names['input-file']}`}
                { ...rest }
                ref={ref}
                onChange={handleFileChange}
            />
            <p 
                className={classes_names["input-file-label"]}
                >
            { filePlaceholder[0] === label ? label : filePlaceholder.map( t => t ).join(", ") }
            </p>
        </label>
        { 
            isFileAdded && 
                <ion-icon 
                    name="close-circle-outline" 
                    onClick={() => removeFile()} 
                    ></ion-icon>
        }
    </div>

});
InputFile.displayName = "InputFile";

export const InputTextArea = forwardRef( ( props, ref ) => {

    const elements = [ "input", "input-textarea" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    return (
        <textarea 
            className={`${classes_names['input']} ${classes_names['input-textarea']}`}
            { ...props }
            ref={ref}
        />
    )

});
InputTextArea.displayName = "InputTextArea";

export const InputNumber = forwardRef( ( props, ref ) => {

    const elements = [ "input", "input-number-container", "input-number", "manual", "step", "manual-step", "vr", "hr", "number-error" ];
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    const { variant, orientation, addIcon, removeIcon, ...rest } = props;

    const [ valueCheck, setValueCheck ] = useState({
        message: "",
    })
    

    function handleValueCheck(stepType, newValue){

        if(stepType === "add"){

            let message = props.valueCheckMessage && props.valueCheckMessage.max ? props.valueCheckMessage.max : `Maximum value set to ${props.max}`;

            if(
                props.max !== undefined && props.max!== null && 
                ( newValue > props.max || parseFloat(newValue) > parseFloat(props.max) )
            ){
                setValueCheck({...valueCheck, message: message });
                return false;
            } else {
                setValueCheck({...valueCheck, message: "" });
                return true;
            }
            
        } 
        if(stepType === "remove"){

            let message = props.valueCheckMessage && props.valueCheckMessage.min ? props.valueCheckMessage.min : `Minimum value set to ${props.min}`;

            if(
                props.min !== undefined && props.min !== null &&  
                ( newValue < props.min || parseFloat(newValue) < parseFloat(props.min) )
            ){
                setValueCheck({...valueCheck, message: message });
                return false;
            } else {
                setValueCheck({...valueCheck, message: "" });
                return true;
            }
        }

    }

    function handleAddStep(){

        let step = props.step ? props.step : 1;

        if(ref && ref.current) {
            let value = ref.current.value;
            let new_value = parseInt(value) + step;
             
            const check = handleValueCheck("add", new_value);

            if(check === false) return;

            ref.current.value = new_value;

            if(props.onChange) {
                props.onChange(ref.current);
            }

        }
    }

    function handleRemoveStep(){

        let step = props.step ? props.step : 1;

        if(ref && ref.current) {
            let value = ref.current.value;
            let new_value = parseInt(value) - step;
            
            const check = handleValueCheck("remove", new_value);

            if(check === false) return;

            ref.current.value = new_value;

            if(props.onChange) {
                props.onChange(ref.current);
            }

        }
    }

    function handleOnChange(e){
        if(variant === "step") return null;
        else if( props.onChange ) {
            props.onChange(e.target);
        }
    }

    return (
        <Fragment>
            <div className={`${classes_names["input-number-container"]} ${ variant && variant !== "" ? classes_names[variant] : classes_names["manual-step"]} ${ orientation && orientation !== "" ? classes_names[orientation] : classes_names["hr"]}`}>
                {   
                    variant === "step" || variant === "manual-step" || variant === undefined || variant === "" ? 
                    removeIcon ? removeIcon : <ion-icon name="remove-circle-outline" onClick={handleRemoveStep}></ion-icon> 
                    : null
                }
                <input 
                    className={`${classes_names['input']} ${classes_names['input-number']}`}
                    type="number"
                    { ...rest }
                    ref={ref}
                    onChange={handleOnChange}
                />
                {   
                    variant === "step" || variant === "manual-step" || variant === undefined || variant === "" ? 
                    addIcon ? addIcon : <ion-icon name="add-circle-outline" onClick={handleAddStep}></ion-icon> 
                    : null
                }
            </div>
            { valueCheck.message !== "" && <p className={classes_names["number-error"]}>{ valueCheck.message }</p>  }
        </Fragment>
    )

});
InputNumber.displayName = "InputNumber";