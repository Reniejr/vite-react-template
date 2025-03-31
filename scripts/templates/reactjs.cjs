/**
 * Default template for creating a new UI component in React.
 * 
 * This template includes a React functional component structure 
 * with a placeholder for importing styles and component code.
 * 
 * TO USE : REPLACE {{filename}} with proper name
 * TO USE IN FUNCTION: REPLACE {{filename}} with ${filename}.
 * @constant {string} UI_COMPONENT_DEFAULT_TEMPLATE
 * @param {string} filename
 * 
 */
const UI_COMPONENT_DEFAULT_TEMPLATE = `import React from 'react';\n\n// Styles\nimport styles from './{{filename}}.module.scss';\n\nconst {{filename}} = () => {
    return (
    <div>
        {/* Your component code here */}
    </div>
    );
};

export default {{filename}};
`

module.exports = { UI_COMPONENT_DEFAULT_TEMPLATE }

/**
 * Generates a React JSX functional component template as a string.
 * 
 * This function creates a basic React functional component structure
 * with a placeholder for importing styles and component code.
 * 
 * @function generateReactJSXComponent
 * @param {string} filename - The name of the component file.
 * @returns {string} - A string template for the React JSX component.
 */
function generateReactJSXComponent(filename){
    return`import React from 'react';\n\n// Styles\nimport styles from './${filename}.module.scss';\n\nconst ${filename} = () => {
    return (
    <div>
        {/* Your component code here */}
    </div>
    );
};

export default ${filename};
    `
}


module.exports = { generateReactJSXComponent }