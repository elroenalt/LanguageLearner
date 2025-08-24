
let checked = false;
let questionSet;
let curQuestion = 0;
let displayScreen;
let languages = [];
const jsonFiles = [
  'jsonFiles/OldNorse.json',
];
async function initializeApp() {
    try {
    await fetchJsonFiles()
    console.log('<_> >_<')
    const languageDisplay = new LanguageDisplay(languages[0])
    displayScreen = new DisplayScreen()

    } catch (error) {
        console.error("Error while starting:", error);
    }
}
async function fetchJsonFiles() {
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
    }catch (error) {
        console.error("Error while starting:", error);
    } 
}
class LanguageDisplay{
    constructor(language) {
        this.container = createElement({type: 'div'})
        const languagesHTML = document.querySelector('#languages')
        const table = createTable('questionContainer')
        let cell = table.rows[0].cells[0]
        const languageName = createElement({type: 'span',text: language.name + ": "})
        cell = table.rows[0].cells[1]
        cell.appendChild(languageName)
        const train = createElement({class: 'trainLanguage',type: 'span',text: 'train',onClick: () => initQuestions(language,5,true)})
        cell.appendChild(train)
        this.container.appendChild(table)
        languagesHTML.appendChild(this.container)
    }
}
function createTable(className = undefined,rows = 2,cols = 2) {
    const table = createElement({type: 'table',class: 'languageTable'})
    table.className = className
    const tbody = createElement({type: 'tbody'})
    for(let row = 0; row < rows; row++) {
        const tr = createElement({type: 'tr'})
        for(let col = 0; col < cols; col++) {
            const td = createElement({type: 'td'})
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }
    table.appendChild(tbody)
    return table
}
class DisplayScreen {
    constructor() {
        this.DisplayScreenHTML = document.querySelector('#DisplayScreen')
        this.QuestionScreen = document.querySelector('#QuestionScreen')
        document.querySelector('#nextButtonQuestion').addEventListener('click', nextButtonClicked)
        this.DictionaryScreen;
        this.currentScreen = this.QuestionScreen;
        document.querySelector('#closeDisplayScreen').addEventListener('click', () => this.closeScreen())
    }
    displayQuestion(question) {
        const corIndex = question.corIndex
        const options = question.options
        const dir = question.dir
        const instruction = document.querySelector('#questionInstructions')
        instruction.textContent = !dir ? options[corIndex].word : options[corIndex].translation
        let value = 0;
        for(let option of options) {
            const label = document.querySelector('label[for=option-'+value+']')
            label.textContent = dir ? option.word : option.translation
            label.className = ""
            value++;
        }
    }
    highlightQuestion(highlights = [false,false,false],disable) {
        for(let value = 0; value < 3; value++) {
            const label = document.querySelector('label[for=option-'+value+']')
            if(disable) {
                label.classList.add('disable')
            }
            if(highlights[value]) {
                label.classList.add(highlights[value])
            }else {
                label.className = ""
            }
        }
    }
    openScreen() {
        this.DisplayScreenHTML.style.display = 'block'
        this.currentScreen.style.display = 'block';
    }
    closeScreen() {
        this.DisplayScreenHTML.style.display = 'none'
        this.currentScreen.style.display = 'none';
        this.currentScreen = undefined
    }

}
function initQuestions(language,amount,dirType) {
    curQuestion = 0
    displayScreen.currentScreen = displayScreen.QuestionScreen
    console.log(displayScreen.currentScreen)
    questionSet = createQuestionSet(language,amount,dirType)
    displayScreen.displayQuestion(questionSet.questions[curQuestion])
    checked = false;
    displayScreen.openScreen()
}
function createQuestionSet(language,amount,dirType = 0) {
    let QuestionSet = {questions: [],name: language.name,progress: {incorrect: 0,correct: 0,length:amount}}
    let used = new Set()
    for(let i = 0; i < amount; i++) {
        const wordIndex = getRndIntExcept(used,amount)
        console.log(wordIndex)
        const question = new Question(language,wordIndex,dirType)
        QuestionSet.questions.push(question)
    }
    return QuestionSet
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
    const button = document.querySelector('#nextButtonQuestion')
    let highlight = [false, false, false]

    if (!checked) {
        const selectedOption = getSelectedRadio('questionSet');
        if (selectedOption === null) {
            return;
        }

        const question = questionSet.questions[curQuestion]
        if (parseInt(selectedOption) !== question.corIndex) {
            highlight[selectedOption] = 'red'
        }
        highlight[question.corIndex] = 'green'
        
        deselectRadioGroup('questionSet')
        displayScreen.highlightQuestion(highlight,true)
        button.textContent = 'Next'
        checked = true
    } else {
        curQuestion++;
        if (curQuestion < questionSet.progress.length) {
            const question = questionSet.questions[curQuestion]
            displayScreen.displayQuestion(question)
            deselectRadioGroup('questionSet')
            displayScreen.highlightQuestion() // Clear highlights
            button.textContent = 'Check'
            checked = false
        } else {
            // Quiz is finished
            alert('Quiz complete!');
            displayScreen.closeScreen();
            checked = false;
        }
    }
}
function getSelectedRadio(groupName) {
    let selected = document.querySelector('input[name="'+groupName+'"]:checked')
    if(selected){
        return selected.value
    }
    return null
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
    if(options.onClick) {
         element.addEventListener('click', options.onClick)
         element.classList.add('pointer')
    }
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