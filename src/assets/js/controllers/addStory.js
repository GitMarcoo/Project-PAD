document.addEventListener('DOMContentLoaded', function () {

    const textarea = document.getElementById("story");
    textarea.addEventListener("input", limitTextarea);

    function limitTextarea() {
        if (textarea.value.length > 8000) {
            textarea.value = textarea.value.slice(0, 8000);
        }
    }

    const title = document.getElementById("title");
    title.addEventListener("input", limitTextarea2);

    function limitTextarea2() {
        if (title.value.length > 45) {
            textarea.value = textarea.value.slice(0, 45);

        }
    }

    console.log("idk");
    const storyTextarea = document.getElementById('story');
    const charCountDiv = document.getElementById('char-count');

    storyTextarea.addEventListener('input', () => {
        const characterCount = storyTextarea.value.length;
        charCountDiv.innerText = `${characterCount}/8000 characters`;
    });

    const sampleFileInput = document.getElementById('sampleFile');
    const caption = document.getElementById('caption');

    sampleFileInput.addEventListener('change', () => {
        if (sampleFileInput.value) {
            const fileName = sampleFileInput.value.split('\\').pop();
            caption.innerText = fileName;
        } else {
            caption.innerText = 'Afbeelding toevoegen';
        }
    });

    const resize = document.getElementById("story");
    resize.addEventListener("input", function() {
        autoResizeTextarea(this);
    });

    function autoResizeTextarea(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.scrollTop = textarea.scrollHeight;
    }


});