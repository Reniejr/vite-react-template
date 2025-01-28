/* eslint-disable */
import React, { useState, useRef } from 'react';

import { InputContainer, InputLabel, InputNumber } from 'components/v1/Inputs/Inputs'

// Styles
import styles from './TestPage.module.scss';

const TestPage = () => {

    const input_number = useRef(null);

    const [ number, setNumber ] = useState(5);

    function handleNumberInput(e){
        console.log(e.value);
        setNumber(Number(e.value))
    }

    return (
    <div
        style={{ width: '100%', height: '100vh' }}
    >
        <InputContainer>
            <InputLabel>Input Number</InputLabel>
            <InputNumber
                name="inputNumber"
                label="Input Number"
                value={number}
                min={0}
                max={7}
                ref={input_number}
                orientation="hr"
                variant="manual-step"
                onChange={handleNumberInput}
            />
        </InputContainer>
    </div>
    );
};

export default TestPage;
    