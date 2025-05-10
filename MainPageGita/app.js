const sectionCard = document.querySelector('.section-card');
const actionBtn = document.querySelector('#action-btn');
const headingInfo = document.querySelector('.headingInfo');
const previousActionbtn = document.querySelector('#previous-btn');



async function fetchedData(chapterNumber = 1, verseNumber = 1) {
    const url = `https://vedicscriptures.github.io/slok/${chapterNumber}/${verseNumber}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            let errorMsg = `Data fetching unsuccessful. Status: ${response.status}`;
            try {
                // Try to get a more specific error message from the API response
                const errorData = await response.json();
                errorMsg = errorData.error || errorData.message || `Error ${response.status}: Failed to fetch data.`;
            } catch (e) {
                // If error response is not JSON, use the status text or a generic message
                errorMsg = response.statusText || `Error ${response.status}: Failed to fetch data.`;
            }
            throw new Error(errorMsg);
        }
        const data = await response.json(); // Added await
        return data;
    } catch (error) {
        console.error('Error in fetchedData:', error); // Log the error
        throw error; // Re-throw to be caught by the caller
    }
}

function setLoadingMessage(message = "Loading...") {
    if (sectionCard) {
        // This styling attempts to center the text.
        // For best results, .section-card should have a min-height in your CSS.
        sectionCard.innerHTML = '';
        // let loadingPage = document.querySelector('.loading-dots');
        let loadingpage = document.createElement('div');
        loadingpage.className = 'loading-dots';
        sectionCard.appendChild(loadingpage);
        let loadingdot1= document.createElement('i');
        loadingdot1.className = 'fas fa-circle dot-1'
        let loadingdot2 = document.createElement('i')
        loadingdot2.className = 'fas fa-circle dot-2'
        let loadingdot3 = document.createElement('i')
        loadingdot3.className = 'fas fa-circle dot-3';
        let loadingMessage = document.createElement('p');


        loadingMessage.textContent = message;
        loadingMessage.style.color = 'black';
        loadingMessage.style.fontSize  = '20px';
        loadingMessage.style.textAlign = 'center';
        loadingMessage.style.fontWeight  = 'bold'
        loadingpage.appendChild(loadingMessage)

        loadingpage.appendChild(loadingdot1)
        loadingpage.appendChild(loadingdot2)
        loadingpage.appendChild(loadingdot3)

        // if (loadingPage) {
        //     loadingPage.classList.toggle('loadingState');
        // } else {
        //     // This console.warn can be helpful for debugging if the .loading-dots element is unexpectedly missing.
        //     // It indicates that the loading animation/style controlled by .loading-dots and .loadingState
        //     // will not be applied because the element wasn't found. This is expected if showData (or similar)
        //     // previously cleared the parent (e.g., sectionCard.innerHTML = '').
        //     console.warn("'.loading-dots' element not found. Cannot toggle loading state.");
        // }
    }
}

function showData(data) {
    let lang = 'Hindi';
    // data = [slok, et, ec];
    let slok = data[0];
    let et = data[1];
    let ec = data[2];

    if (sectionCard) {
        // Clear previous content (e.g., loading message or old verse)

        sectionCard.innerHTML = '';
      
        // Create and append new elements
        const heading = document.createElement('h1');
        heading.textContent = '🕉️' + slok;

        const eHeadingET = document.createElement('h2');
        eHeadingET.className = 'eHeading eHeadingvisible';
        eHeadingET.textContent = 'English Translation'; // Assumed heading text

        const etPara = document.createElement('p');
        etPara.id = 'etPara';
        etPara.textContent = et;

        const eHeadingEC = document.createElement('h2');
        eHeadingEC.className = 'eHeading eHeadingvisible';
        eHeadingEC.textContent = 'English Commentary'; // Assumed heading text

        const ecPara = document.createElement('p');
        ecPara.id = 'ecPara';
        ecPara.textContent = ec;

        sectionCard.appendChild(heading);
        sectionCard.appendChild(eHeadingET);
        sectionCard.appendChild(etPara);
        sectionCard.appendChild(eHeadingEC);
        sectionCard.appendChild(ecPara);

        const hindiBtn = document.createElement('button');
        hindiBtn.className = 'bg-btn hindi-lang-btn'; // Match classes from your HTML
        hindiBtn.innerHTML = `${lang} Translation <i class="fa-solid fa-arrow-right"></i>`;
        sectionCard.appendChild(hindiBtn);

        hindiBtn.addEventListener('click', function() {
            // This button is now only for translating verses.
            // The 'data' variable is from the showData function's scope.
            // Assumes data = [slok, et, ec, ht, hc]
            let ht = data[3]; // Hindi Translation
            let hc = data[4];

            if (sectionCard && ht && hc) { // Check if ht and hc are available
                eHeadingEC.textContent = 'Hindi Explanation';
                eHeadingET.textContent = 'Hindi Translation';
                etPara.textContent = ht;
                ecPara.textContent = hc;
            };
        });
    }
}




function getrequiredDatas(data) {
    if (!data || !data.slok || !data.prabhu || !data.prabhu.et || !data.prabhu.ec) {
        console.error("Invalid data structure received:", data);
        throw new Error("Received invalid data format from API.");
    }
    let slokSans = data.slok;
    // et = english translation
    // ec = english commentary
    let et = data.prabhu.et;
    let ec = data.prabhu.ec;
    // ht and hc are not used by showData in this setup
    let ht = data.rams.ht;
    let hc = data.rams.hc;
    return [slokSans, et, ec , ht , hc];
}

async function presentVerseinLoop(chapter , verse) {
    setLoadingMessage(`Loading Chapter ${chapter}, Verse ${verse}`);
    headingInfo.textContent = 'Fetching...';
    actionBtn.disabled = true;
    actionBtn.innerHTML = 'Loading... <i class="fa-solid fa-spinner fa-spin"></i>';


    try {
        const data = await fetchedData(chapter , verse); // Defaults to Chapter 1, Verse 1
        const requiredData = getrequiredDatas(data);
        showData(requiredData);
        headingInfo.textContent = `Chapter ${chapter} Verse:${verse}`;
        actionBtn.innerHTML = 'Next Verse <i class="fa-solid fa-arrow-right"></i>';
    } catch (error) {
        console.error("Error in presentVerseinLoop:", error);
        sectionCard.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Failed to load verse: ${error.message}</p>`;
        headingInfo.textContent = 'Error';
        actionBtn.innerHTML = 'Retry <i class="fa-solid fa-rotate-right"></i>';
    } finally {
        actionBtn.disabled = false;
    }
}

let currentChapter = 1;
let currentVerse = 0;

actionBtn.addEventListener('click' , ()=>{
     let nextVerse = currentVerse + 1;
    let nextChapter = currentChapter;
    if (nextChapter ==1 && nextVerse ==1){
        previousActionbtn.disabled = true
    }else{
        previousActionbtn.disabled = false
    }

    previousActionbtn.addEventListener('click'  , ()=>{
    console.log('hi');
    nextVerse --;

})


    // Get total verses for the current chapter (ensure chapter key is a string)
    const versesInCurrentChapterString = chapterVersedata[nextChapter.toString()];
    if (!versesInCurrentChapterString) {
        console.error(`Verse data not found for chapter ${nextChapter}`);
        headingInfo.textContent = "Error: Chapter data missing";
        actionBtn.innerHTML = 'Error <i class="fa-solid fa-exclamation-triangle"></i>';
        actionBtn.disabled = true;
        return;
    }
    const versesInCurrentChapter = parseInt(versesInCurrentChapterString, 10);

    if (nextVerse > versesInCurrentChapter) {
        nextChapter++;
        nextVerse = 1; // Reset to verse 1 of the new chapter
    }

    if (nextChapter > chapterCount) { // chapterCount is from data.js (e.g., 18)
        headingInfo.textContent = "End of Bhagavad Gita";
        if (sectionCard) sectionCard.innerHTML = "<p style='text-align:center; padding: 20px;'>🕉️ You have completed all verses. Well done! 🕉️</p>";
        actionBtn.innerHTML = 'Finished <i class="fa-solid fa-check"></i>';
        actionBtn.disabled = true;
        return;
    }

    currentChapter = nextChapter;
    currentVerse = nextVerse;
    presentVerseinLoop(currentChapter, currentVerse);
});

//For a target text 
const searchBtn = document.querySelector('#searchbtn');
const chapterInput = document.querySelector('#chapterinput');
const verseInput = document.querySelector('#verseinput');


//code for populate options
(function (){
    chapterInput.innerHTML = '';
    if (chapterVersedata){
 Object.entries(chapterVersedata).forEach(([key, value]) => {
    let chapterops = document.createElement('option');
    chapterops.value =key;
    chapterops.textContent =  `☸️ Chapter ${key}`;
    chapterInput.appendChild(chapterops);
    if (key === 1){
         chapterops.selected = 'selected'

    }
 
})}else{
    console.log("Can't find the data")
}
})();

function populateVerseOptions(selectedChapterValue) {
    verseInput.innerHTML = ''; // Clear existing verse options
    // Ensure selectedChapterValue is a string for consistent key access
    const chapterKey = String(selectedChapterValue);
    const verseCountString = chapterVersedata[chapterKey];
    if (verseCountString) {
        const verseCount = parseInt(verseCountString, 10);
        for (let i = 1; i <= verseCount; i++) {
            let verseops = document.createElement('option');
            verseops.value = i;
            verseops.textContent = `✡️ Verse ${i}`;
            verseInput.appendChild(verseops);
            if (i === 1) {
                verseops.selected = true; // Select the first verse by default
            }
        }
    } else {
        console.warn(`No verse data found for chapter ${chapterKey}`);
    }
}
// Initial population of verse options
// Ensure this runs after chapter options are potentially populated and a default is selected.
if (chapterInput.options.length > 0 && chapterInput.value) {
    populateVerseOptions(chapterInput.value);
}

// Add event listener to update verse options when the chapter changes
chapterInput.addEventListener('change', function() {
    populateVerseOptions(this.value);
});
//end here








async function discreteVerse(event) {
    console.log('enter in discreteVerse')
    if (event){
        event.preventDefault();
    }
    let chapter = chapterInput.value || '1'; // Default to '1' if empty
    let verse = verseInput.value || '1';   // Default to '1' if empty

    const chapNum = parseInt(chapter);
    const verseNum = parseInt(verse);
    currentChapter = chapNum;
    currentVerse = verseNum;
    actionBtn.innerHTML = 'Next Verse <i class="fa-solid fa-arrow-right"></i>';

    // Basic input validation
    if (isNaN(chapNum) || chapNum <= 0 || isNaN(verseNum) || verseNum <= 0) {
        if (sectionCard) {
            sectionCard.innerHTML = `<p style="color: orange; text-align: center; padding: 20px;">Please enter valid chapter and verse numbers.</p>`;
        }
        headingInfo.textContent = "Invalid Input";
        // chapterInput.value = ''; // Optionally clear inputs
        // verseInput.value = '';
        return;
    }

    setLoadingMessage(`Loading Chapter ${chapter}, Verse ${verse}...`);
    headingInfo.textContent = `Fetching Chapter ${chapter}, Verse ${verse}...`;
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fa-solid  searchicon fa-spin fa-spinner"></i>';

    try {
        const data = await fetchedData(chapter, verse);
        const requiredData = getrequiredDatas(data); // Not async
        showData(requiredData);
        headingInfo.textContent = `Chapter ${chapter} Verse: ${verse}`;
    } catch (error) {
        console.error("Error in discreteVerse:", error);
        sectionCard.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Failed to load verse: ${error.message}</p>`;
        headingInfo.textContent = `Error`;
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fa-solid searchicon fa-magnifying-glass"></i>';
    }
}
searchBtn.addEventListener('click' , ()=>{
    discreteVerse()
})