
let questionSet;
let curQuestion = 0;
let displayScreen;
let languages = [];
const jsonFiles = [
  'jsonFiles/OldNorse.json',
];
async function initializeApp() {
    try {
      for(let file of jsonFiles) {
        const response = await fetch(file)
        if(!response.ok) {
          throw new Error('Error! while laoding '+ file + ' status: ' + responseNorse.status)
        }
        const data = await response.json()
        let words = [];
          for(let segment of data.segments) {
              for(let word of segment.words) {
              words.push(word);
            }
          }
        data.words = words;
        languages.push(data)
      }
    console.log('<_> >_<')
    displayScreen = new DisplayScreen()
    questionSet = createQuestionSet(languages[0],10)
    displayScreen.openScreen()
    displayScreen.displayQuestion(questionSet.questions[curQuestion])

    } catch (error) {
        console.error("Error while starting:", error);
    }
}
class DisplayScreen {
    constructor() {
        this.DisplayScreenHTML = document.querySelector('#DisplayScreen')
        this.QuestionScreen = createQuestionScreen();
        this.DisplayScreenHTML.appendChild(this.QuestionScreen)
        this.DictionaryScreen;
        this.currentScreen = this.QuestionScreen;
    }
    displayQuestion(question) {
        const corIndex = question.corIndex
        const options = question.options
        const dir = question.dir
        const instruction = document.querySelector('#questionInstructions')
        instruction.textContent = !dir ? options[corIndex].word : options[corIndex].translation
        let value = 0;
        for(let option of options) {
            const label = document.querySelector('label[for=questionSet-'+value+']')
            label.textContent = dir ? option.word : option.translation
            label.className = ""
            value++;
        }
    }
    highlightQuestion(highlights = [false,false,false]) {
        for(let value = 0; value < 3; value++) {
            const label = document.querySelector('label[for=questionSet-'+value+']')
            if(highlights[value]) {
                label.classList.add(highlights[value])
            }else {
                label.className = ""
            }
        }
    }
    openScreen() {
        this.DisplayScreenHTML.style.display = 'block'
        if(this.currentScreen) {
            this.currentScreen.style.display = 'block';
        }else {
            throw new Error('Error! while opening '+this.currentScreen)
        }
    }
    closeScreen() {
        this.DisplayScreenHTML.style.display = 'none'
        this.currentScreen.style.display = 'none';
        this.currentScreen = undefined
    }

}
function createQuestionSet(language,amount,dirType = 0) {
    let questionSet = {questions: [],name: language.name,progress: {incorrect: 0,correct: 0,length:amount}}
    let used = new Set()
    for(let i = 0; i < amount; i++) {
        const wordIndex = getRndIntExcept(used,amount)
        console.log(wordIndex)
        const question = new Question(language,wordIndex,dirType)
        questionSet.questions.push(question)
    }
    return questionSet
}
class Question {
    constructor(language,wordIndex,dirType) {
        const words = language.words
        switch(dirType) {
            case 0: 
                this.dir = true
            break;
            case 1:
                this.dir = false
            break;
            case 2:
                this.dir = getRndInt(0,1) > 0 ? true : false
            break;
        }
        const used = new Set([wordIndex])
        const wordPos = getRndInt(0,3)
        let options = []
        for(let i = 0; i < 3; i++) {
            const index = getRndIntExcept(used,language.words.length)
            used.add(index)
            options.push(i == wordPos ? words[wordIndex] : words[index])
        }
        this.corIndex = wordPos
        this.options = options
    }
}
function deselectRadioGroup(groupName) {
  const radios = document.querySelectorAll(`input[name="${groupName}"]`);
  for (const radio of radios) {
    radio.checked = false;
  }
}
function nextButtonClicked() {
    const selectedOption = getSelectedRadio('questionSet')
    const question = questionSet.questions[curQuestion]
    let highlight = [false,false,false]
    if(selectedOption !== question.corIndex) {
        highlight[selectedOption] = 'red'
    }
    highlight[question.corIndex] = 'green'
    deselectRadioGroup('questionSet')
    displayScreen.highlightQuestion(highlight)
}
function getSelectedRadio(groupName) {
    let selected = document.querySelector('input[name="'+groupName+'"]:checked')
    if(selected){
        return selected.value
    }
    return null
}
function createQuestionScreen() {
    const container = createElement({type: 'div',id: 'questionContainer'})
    container.style.display = 'none'
    const instruction = createElement({type: 'span',id: 'questionInstructions',text: 'translate aldri'})
    const options = createRadio(['option 0','option 1','option 2'],'questionSet','questionSet')
    const button = createElement({
        type: 'button',
        onClick: nextButtonClicked,
        text: 'check',
        id: 'nextButtonQuestion'
    })
    container.appendChild(instruction)
    container.appendChild(options)
    container.appendChild(button)

    return container
}
function createRadio(options = ['option-0','option-1','option-2'],groupName = 'name',id = undefined) {
    const container = createElement({type: 'div',className: 'radio-container',id: id})
    let value = 0;
    for(let option of options) {
        let id = groupName +'-'+ value
        const radio = createElement({type: 'input',id: id,name: groupName,value: value,inputType: 'radio',});

        const label = createElement({ 
            type: 'label', 
            text: option,
            onClick: () => radio.click() 
        });
        label.setAttribute('for', id);

        container.appendChild(radio)
        container.appendChild(label)

        value++;
    }
    return container
}
function createElement(options) {
    const element = document.createElement(options.type || 'div')
    if(options.id) element.id = options.id;
    if(options.className) element.className = options.className;
    if(options.text) element.textContent = options.text;
    if(options.onClick) element.addEventListener('click', options.onClick)
    if (options.type === 'input') {
        if (options.name) element.name = options.name;
        if (options.value) element.value = options.value;
        if (options.inputType) element.type = options.inputType; 
    }
    return element
}
function getAmountRndInt(amount,max) {
  if(amount > max)  return false
  const array = Array.from({ length: max }, (_, index) => index);
  let integers = []
  for(let i = 0; i < amount; i++) {
    const index = getRndInt(0,array.length)
    const value = array[index];
    array.splice(index,1)
    integers.push(value)
  }
  return integers
}
function getRndInt(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
function getRndIntExcept(nums,max) {
  while(true) {
    let pos = getRndInt(0, max)
    if(!nums.has(pos)) return pos
  }
}
initializeApp()