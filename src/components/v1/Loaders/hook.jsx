/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react'

const useLoader = ( loaderState ) => {

    const [ state, setState ] = loaderState;

    const [ hookState, setHookState ] = useState(state)

    function on(initialMessage){

        let new_hook_state = { 
            ...hookState,
            isActive: true,
            message: initialMessage !== undefined && initialMessage !== null && initialMessage !== "" ? initialMessage : state.message, 
        }

        console.log("on",new_hook_state)

        setHookState(new_hook_state);
        setState(new_hook_state);

    }

    function off(initialMessage){

        let new_hook_state = {
            ...hookState, 
            isActive: false,
            message: initialMessage !== undefined && initialMessage !== null && initialMessage !== "" ? initialMessage : state.message, 
        }

        setHookState(new_hook_state);
        setState(new_hook_state);

    }

    function update(newMessage){

        let new_hook_state = { 
            ...hookState,
            isActive: true,
            message: newMessage, 
        }

        setHookState(new_hook_state);
        setState(new_hook_state);

    }

    return {
        state: hookState,
        on,
        off,
        update,
    }

}

export default useLoader