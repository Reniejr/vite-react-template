/* eslint-disable react/prop-types */
/* eslint-disable-next-line no-unused-vars */
import React, { useState, useEffect } from 'react';

// Styles
import styles from './Cards.module.scss';
import { generateClassesNames } from '../../../styles/utilities';

// million-ignore
export const FlipCard = ({ children, ...props }) => {

    const elements = [
        "flip-card", 
        "flip-card-inner", 
        "flip-card-front", 
        "flip-card-back",
        "hover",
        "click",
        "click-on",
        "click-off",
        "flip_trigger"
    ]
    const classes_names = generateClassesNames(elements, styles, props.additionalStyles);

    const [ frontContent, setFrontContent ] = useState(null);
    const [ backContent, setBackContent ] = useState(null);
    const [ flipTriggers, setFlipTriggers ] = useState({
        single: null,
        front: null,
        back: null
    });

    useEffect(() => {

        function setCardSidesContent(){
            const front_content = children.find( child => child.type === FlipCardFront)
            const back_content = children.find( child => child.type === FlipCardBack)
            setFrontContent(front_content)
            setBackContent(back_content)
        }

        function setFlipTriggersContent(){

            const single_trigger = children.find( child => child.type === FlipCardTrigger)
            const front_trigger = children.find( child => child.type === FlipCardTriggerFront)
            const back_trigger = children.find( child => child.type === FlipCardTriggerBack)

            setFlipTriggers({
                single: single_trigger,
                front: front_trigger,
                back: back_trigger
            })

        }

        setCardSidesContent()
        setFlipTriggersContent()

    }, [children])

    /* eslint-disable-next-line no-unused-vars */
    const { variant, ...rest } = props;

    const [ { isFlipped }, setIsFlipped ] = useState({ isFlipped: false });

    function handleFlipCard(side){
        if( side !== undefined && side !== null && side !== ""  ){

            setIsFlipped({ isFlipped: side === "front" ? false : true })

        } else {
            setIsFlipped({ isFlipped: !isFlipped });
        }
    }


    return(
        <div className={`
            ${classes_names["flip-card"]} 
            ${variant && variant !== "" ? 
                classes_names[variant] : 
                classes_names["click"]
            }
            ${variant === "click" ?
                isFlipped ? classes_names["click-on"] : classes_names["click-off"]
                : ""
            } 
                `}
            >
            <div className={classes_names["flip-card-inner"]}>
                <div className={classes_names["flip-card-front"]}>
                    { frontContent }
                    { flipTriggers.single && <div className={classes_names["flip-trigger"]} onClick={() => handleFlipCard()}>{flipTriggers.single}</div> }
                    { flipTriggers.front && <div className={classes_names["flip-trigger"]} onClick={() => handleFlipCard("back")}>{flipTriggers.front}</div> }
                </div>
                <div className={classes_names["flip-card-back"]}>
                    { backContent }
                    { flipTriggers.single && <div className={classes_names["flip-trigger"]} onClick={() => handleFlipCard()}>{flipTriggers.single}</div> }
                    { flipTriggers.back && <div className={classes_names["flip-trigger"]} onClick={() => handleFlipCard("front")}>{flipTriggers.back}</div> }
                </div>
            </div>
        </div>
    )

};

// million-ignore
export const FlipCardFront = ({ children }) => children;

// million-ignore
export const FlipCardBack = ({ children }) => children;

// million-ignore
export const FlipCardTrigger = ({ children }) => children;

// million-ignore
export const FlipCardTriggerFront = ({ children }) => children;

// million-ignore
export const FlipCardTriggerBack = ({ children }) => children;