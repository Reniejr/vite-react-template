function generateClassesNames(elementsNames, styles, additionalStyles){

    let new_elements_class_names = {}

    elementsNames.forEach( elementName => {
        new_elements_class_names[elementName] = `${styles[elementName]} ${additionalStyles ? additionalStyles[elementName] : ""}`.trim()
    })

    return new_elements_class_names

}

export { generateClassesNames }