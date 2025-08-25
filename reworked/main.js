
let Amount = 5
let Dir = 2;
let checked = false;
let questionSet;
let curQuestion = 0;
let displayScreen;
let TinyScreen;
let languages = [];
const jsonFiles = [
  'jsonFiles/OldNorse.json',
  'jsonFiles/French.json',
];
async function initializeApp() {
    try {
    await fetchJsonFiles()
    console.log('<_> >_<')
    for(let language of languages) {
        const languageDisplay = new LanguageDisplay(language)
    }
    displayScreen = new DisplayScreen()
    TinyScreen = new tinyScreen()

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
class tinyScreen {
    constructor() {
        this.tinyScreenHTML = document.querySelector('#tinyScreen')
        this.languagSettings = document.querySelector('#questionSettings')
        const closetinyScreen = document.querySelector('#closetinyScreen')
        closetinyScreen.addEventListener('click', () => this.closeTinyScreen())
        document.getElementById('settings' ).addEventListener('click', ()=> TinyScreen.displayLanguageSettings())
    }
    displayLanguageSettings() {
        this.openScreen(0)
        document.querySelector('#saveQuestionSettings').addEventListener('click', () => this.saveSettings())
        const languageDisp = document.querySelector('#titleQuestionSettings')
        languageDisp.textContent = 'settings '
    }
    saveSettings() {
        Amount = document.querySelector('#setAmount').value
        Dir = parseInt(document.querySelector('#setType').value)
    }
    openScreen(screen) {
        this.tinyScreenHTML.style.display = 'block'
        switch(screen) {
            case 0: 
                this.languagSettings.style.display = 'block'
            break;
        }
    }
    closeTinyScreen() {
        this.tinyScreenHTML.style.display = 'none'
        this.languagSettings.style.display = 'none'
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
        const train = createElement({className: 'trainLanguage',type: 'span',text: 'start Session',onClick: () => initQuestions(language,Amount,Dir)})
        cell.appendChild(train)
        cell = table.rows[1].cells[1]
        const dictionary = createElement({className: 'dictionary',type: 'span',text: 'dictionary',onClick: () => initQuestions(language,Amount,Dir)})
        cell.appendChild(dictionary)
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
        this.questionProgressBar = document.querySelector('#ProgressBar')
        document.querySelector('#nextButtonQuestion').addEventListener('click', nextButtonClicked)
        this.DictionaryScreen;
        this.currentScreen = this.QuestionScreen;
        document.querySelector('#closeDisplayScreen').addEventListener('click', () => this.closeScreen())
    }
    displayQuestion(question) {
        const Progress = questionSet.progress
        const progress = ((Progress.correct + Progress.incorrect) / Progress.length) * 100
        this.questionProgressBar.style.width = progress + "%"
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
        this.QuestionScreen.style.display = 'none';
    }

}
function initQuestions(language,amount,dirType) {
    curQuestion = 0
    this.currentScreen = this.QuestionScreen
    questionSet = createQuestionSet(language,amount,dirType)
    displayScreen.displayQuestion(questionSet.questions[curQuestion])
    checked = false;
    displayScreen.openScreen()
}
function createQuestionSet(language,amount,dirType = 0) {
    let QuestionSet = {questions: [],name: language.name,progress: {incorrect: 0,correct: 0,length:amount}}
    
    const uniqueWordIndices = new Set();
    const totalWords = language.words.length;
    
    while (uniqueWordIndices.size < amount) {
        const randomIndex = getRndInt(0, totalWords);
        uniqueWordIndices.add(randomIndex);
    }
    
    const wordIndices = Array.from(uniqueWordIndices);

    for(let i = 0; i < amount; i++) {
        const wordIndex = wordIndices[i];
        const question = new Question(language,wordIndex,dirType);
        QuestionSet.questions.push(question);
    }

    return QuestionSet;
}
class Question {
    constructor(language,wordIndex,dirType) {
        const words = language.words
        console.log(dirType)
        switch(dirType) {
            case 0: 
                this.dir = true
                console.log('a')
            break;
            case 1:
                this.dir = false
                console.log('b')
            break;
            case 2:
                this.dir = getRndInt(0,1) > 0 ? true : false
                console.log('c')
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
    const Progress = questionSet.progress
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
            Progress.incorrect++
        }else {
            Progress.correct++
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