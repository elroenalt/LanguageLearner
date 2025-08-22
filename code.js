const App = document.querySelector('#app')
const Progress = document.querySelector('#progressBarQuestions')
const QuestionDisplay = document.querySelector('#Questions')
const closeQuestionButton = document.querySelector('#closeButtonQuestions')
const nextButtonQuestions = document.querySelector('#nextButtonQuestions')
const radios = document.querySelectorAll('input[name="myRadio"]'); 
const question = document.querySelector('#WordScentenceQuestions');
const overlayScreen = document.querySelector('#OverlayScreen')
const endScreenQuestion = document.querySelector('#alertScreenQuestions')
const backToMenuButton = document.querySelector('#backToMenuQuestions')
const languageOverlay = document.querySelector('#LanguageOverlay')
const timeDisp = document.getElementById('time');
const dateDisp = document.getElementById('date');
const IncorectQuestions = document.querySelector('#incorectQuestions')
const CorectQuestions = document.querySelector('#corectQuestions')
const closeButtonWordIndex = document.querySelector('#closeButtonWordIndex')
const WordIndex = document.querySelector('#WordIndex')
const dictionaryContent = document.querySelector('#dictionary-content')

let curLanguage;
let initedWD = new Set()
let Check = true
const radioColor = '#1C1C1C'
let curQuestion = 0
let correctRadio;
let languages = []
let oldNorseData;
let frenchData;
let questionSet;

//dir true = word -> translation ex. oldNorse -> English

async function loadData() {
  try {
    const responseNorse = await fetch('jsonFiles/OldNorse.json');
    if (!responseNorse.ok) {
      throw new Error(`HTTP error! status: ${responseNorse.status}`);
    }
    oldNorseData = await responseNorse.json();
    
    const responseFrench = await fetch('jsonFiles/French.json');
    if (!responseFrench.ok) {
      throw new Error(`HTTP error! status: ${responseFrench.status}`);
    }
    frenchData = await responseFrench.json();

    console.log("Daten erfolgreich geladen!");
    console.log("OldNorse Daten:", oldNorseData);
    console.log("French Daten:", frenchData);
    initializeApp();

  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
  }
  setup()

}
function setup() {
  console.log('<_>')
  languages.push(oldNorseData)
  languages.push(french)
  for(let language of languages) {
    let words = []
    for(let segment of language.segments) {
      for(let word of segment.words) {
        words.push(word)
      }
    }
    language.words = words;
  }
  toggleDisplay(endScreenQuestion,false)
  toggleDisplay(overlayScreen,true)
  loadLanguages()
  updateTime();
  updateDate();
}
function loadLanguages() {
  languageOverlay.innerHTML = ''
  for(let language of languages) {
    createLanguageDisplay(language)
  }
}
function createLanguageDisplay(language) {
  const name = language.name + ": "
  const container = document.createElement('div')
  const table = createTable('languageTable')
  let cell = table.rows[0].cells[1]
  const nameDisp = createWordDisp(name,'nameDisp')
  const dictionary = createWordDisp("Open Dictionary",'tableButton',() => OpenDictionary(language))
  cell.appendChild(dictionary)
  cell = table.rows[1].cells[1]
  const dropdownList = createDropdown(language.name + "Dropdown", [5,10,20], 'dropdownList')
  cell.appendChild(dropdownList)
  const train = createWordDisp("Do Exercise",'tableButton',() => initExcersie(language,false))
  cell.appendChild(train)
  cell = table.rows[0].cells[0]
  cell.appendChild(nameDisp)
  container.appendChild(table)
  languageOverlay.appendChild(container)
}
function createDropdown(id, optionsArray = [5,10,20], Class = 'dropdownList') {
  const selectElement = document.createElement('select')
  selectElement.id = id;
  selectElement.className = Class
  optionsArray.forEach((optionText, index) => {
    const option = document.createElement('option')
    option.value = optionText
    option.textContent = optionText
    selectElement.appendChild(option);
  })
  return selectElement
}
function OpenDictionary(language) {
  console.log("dictionary: "+ language.name)
  if(!initedWD.has(language.name)) {
    createDictionary(language)
  }
  toggleDisplay(WordIndex,true)
  toggleDisplay(language.name + "Dictionary",true,false)
  curLanguage = language.name
  initedWD.add(language.name)
}
function createDictionary(language) {
  const table = createTable('LanguageDisp',language.segments.length*2+1,1,language.name + "Dictionary")
  let cell = table.rows[0].cells[0]
  cell.className = 'DictionaryNameDisp'
  const name = createWordDisp(language.name,'')
  cell.appendChild(name)
  const segments = language.segments
  let i = 1
  let j = 2
  for(let segment of segments) {
    cell = table.rows[i].cells[0]
    const segmentName = createWordDisp(segment.name,'DictionarySegNameDisp')
    const openSegment = createWordDisp('↕','openDictionarySegment',() => openCloseSegment(segment))
    cell.appendChild(segmentName)
    cell.appendChild(openSegment)
    i += 2
    const words = createWordDisp("",'dictionarySegmentWords')
    words.id = segment.name + "open"
    for(let word of segment.words) {
      const wordX = document.createTextNode(word.word + " --- " + word.translation);
      const br = document.createElement('br')
      words.appendChild(wordX)
      words.appendChild(br)
    }
    segment.open = false
    toggleDisplay(words,false)
    cell = table.rows[j].cells[0]
    cell.appendChild(words)
    j += 2
  }
  
  dictionaryContent.appendChild(table)
}
function openCloseSegment(segment) {
  toggleDisplay(segment.name + "open",!segment.open,false)
  segment.open = !segment.open
}
function initExcersie(language,dir = false) {
  const dropdownElement = document.getElementById(language.name + "Dropdown");
  const amount = dropdownElement.value
  generateNewQuestionSet(amount,language,dir)
  displayQuestion(questionSet.questions[curQuestion])
}
function createTable(Class,rows = 3,cols = 2,id = undefined) {
  const table = document.createElement('table');
  table.className = Class
  table.id = id
  const tbody = document.createElement('tbody');
  for(let row = 0; row < rows; row++) {
    const rowX = document.createElement('tr');
    for(let col = 0; col < cols; col++) {
      const cellX = document.createElement('td');
      rowX.appendChild(cellX)
    }
    tbody.appendChild(rowX)
  }
  table.appendChild(tbody)
  return table;
}
function createWordDisp(word,Class,onClick) {
  let element = document.createElement('span')
  element.textContent = word
  element.className = Class
  if(onClick) {
    element.addEventListener('click',(e) => {
      onClick()
    })
  }
  return element;
}
function displayQuestion(set) {
  
  const dir = set.dir
  const correctWord = set.correctWord
  const correctWordPos = set.correcrWordPos
  const options = set.options
  question.innerHTML = dir ? correctWord.word : correctWord.translation
  correctRadio = correctWordPos
  displayOptions(options,dir)
  toggleDisplay(QuestionDisplay,true)
}
function generateNewQuestionSet(amount,language,dir = true) {
  const words = language.words
  const QuestionSet = {correct: 0,incorrect: 0,length: amount,name:language.name,questions: []}
  let correctWords = getAmountRndInt(amount,language.words.length)
  for(let i = 0; i < amount; i++) {
    const corWordIndex = correctWords[i]
    const corWordPos = getRndInt(0,3)
    const options = createOptions(words,corWordIndex,corWordPos)
    let question = {
      dir: dir,
      correctWord: words[corWordIndex],
      correcrWordPos: corWordPos,
      options: options
    }
    QuestionSet.questions.push(question)
  }
  questionSet = QuestionSet;
}
function createOptions(words,correctWordIndex,correctWordPos) {
  const numberSet = new Set([correctWordIndex])
  const options = []
  for(let i = 0; i < 3; i++) {
    if(i === correctWordPos)  {
      const word = words[correctWordIndex]
      options.push(word);
      correctRadio = i
    }
    else {
      const wordIndex = getRndIntExcept(numberSet,words.length)
      const word = words[wordIndex]
      options.push(word)
      numberSet.add(wordIndex)
    }
  }
  return options
}
function displayOptions(options = ['Option 0', 'Option 1', 'Option 2'],dir = true) {
   radios.forEach(radio => {
    radio.checked = false;
  });
  radios.forEach((radio, index) => {
    const radioId = radio.id;
    const label = document.querySelector(`label[for="${radioId}"]`);
    let option = options[index]
    if (label && options[index]) {
      label.classList.remove('correct', 'incorrect');
      label.textContent = dir ? option.translation : option.word;
    }
  });
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
function toggleDisplay(name,onOff,defined = true) {
  if(defined) {
    name.style.display = onOff ? 'block' : 'none' 
  }else {
    document.getElementById(name).style.display = onOff ? 'block' : 'none'
  }
}
function getSelectedOptions() {
  const selected = document.querySelector('input[name="myRadio"]:checked');
  return selected ? selected.value : false
}
function highlightRadio(corPos, isCorrect) {
    const radio = radios[corPos];
    const radioId = radio.id;
    const label = document.querySelector(`label[for="${radioId}"]`);

    if (label) {
        if (isCorrect) {
            label.classList.add('correct');
        } else {
            label.classList.add('incorrect');
        }
    }
}
function nexClicked() {
  
  if(Check) {
    const selected = getSelectedOptions()
    if(!selected) {
      return false
    }
    if(selected == correctRadio) {
      questionSet.correct += 1
    }else  {
      highlightRadio(selected,false)
      questionSet.incorrect += 1
    }
    highlightRadio(correctRadio,'green')
    nextButtonQuestions.innerHTML = 'Next'
  }else {
    nextButtonQuestions.innerHTML = 'Check'
    curQuestion++
    if(curQuestion < questionSet.length) {
      displayQuestion(questionSet.questions[curQuestion])
    }else {  
      curQuestion = 0;
      overlayScreen.style.backgroundColor = 0
      IncorectQuestions.textContent = 'incorect: ' + questionSet.incorrect;
      CorectQuestions.textContent = 'corect: ' + questionSet.correct;
      toggleDisplay(endScreenQuestion,true)
      toggleDisplay(overlayScreen,true)
    }
  }
  Check = !Check
}
nextButtonQuestions.addEventListener('click', nexClicked)
backToMenuButton.addEventListener('click', (e) => {
  toggleDisplay(endScreenQuestion,false)
  toggleDisplay(QuestionDisplay,false)
})
closeQuestionButton.addEventListener('click', (e) => {
  toggleDisplay(QuestionDisplay,false)
})
closeButtonWordIndex.addEventListener('click', (e) => {
  toggleDisplay(WordIndex,false)
  toggleDisplay(curLanguage +"Dictionary",false,false)
})
function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const timeString = `${hours}:${formattedMinutes}`;
  timeDisp.textContent = timeString;
  if(hours == 0 && minutes == 0) {
    updateDate()
  }
}
function updateDate() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1; 
  const year = now.getFullYear();
  const dateString = `${day}.${month}.${year}`;
  document.getElementById('date').textContent = dateString;
}
loadData()
setInterval(updateTime, 60000);
