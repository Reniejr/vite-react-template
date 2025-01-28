/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';

import { InputContainer, InputLabel, InputNumber } from 'components/v1/Inputs/Inputs'

import { 
    FlipCard, 
    FlipCardFront, 
    FlipCardBack,
    FlipCardTrigger,
    FlipCardTriggerBack,
    FlipCardTriggerFront
} from 'components/v1/Cards/Cards'

// Styles
import styles from './TestPage.module.scss';

const TestPage = () => {

    const input_number = useRef(null);

    const [ number, setNumber ] = useState(5);

    function handleNumberInput(e){
        console.log(e.value);
        setNumber(Number(e.value))
    }

    const [ content, setContent ] = useState('Hello World');

    useEffect(() => {

        setInterval(() => {
            setContent(Math.random());
        }, 2000)

    }, []);

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
        <FlipCard additionalStyles={styles} variant="click">
            <FlipCardFront>
                <h1>{content}</h1>
                <button onClick={() => {console.log("internal click")}}>Flip</button>
            </FlipCardFront>
            <FlipCardBack>
                <h2>Back</h2>
            </FlipCardBack>
            <FlipCardTrigger>
                <button onClick={() => {console.log("flip")}}>Flip</button>
            </FlipCardTrigger>
            {/* <FlipCardTriggerFront>
                <button>Flip to back</button>
            </FlipCardTriggerFront> */}
            {/* <FlipCardTriggerBack>
                <button>Flip to front</button>
            </FlipCardTriggerBack> */}
        </FlipCard>
    </div>
    );
};

export default TestPage;
    