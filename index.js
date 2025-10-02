document.addEventListener('DOMContentLoaded', () => {
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            document.body.className = theme;
        });
    });

    const slider = document.querySelector('.image-slider');
    const slides = document.querySelectorAll('.slide');
    const cardPreview = document.getElementById('card-preview');
    const slideWidth = slides[0].clientWidth;
    const prevArrow = document.getElementById('prev-slide');
    const nextArrow = document.getElementById('next-slide');
    const dotsContainer = document.querySelector('.slide-dots');

    let currentIndex = 0;
    let isSwiping = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function setSliderPosition() {
        slider.style.transform = `translateX(${currentTranslate}px)`;
    }
    function goToSlide(index) {
        if (index < 0 || index >= slides.length) return;
        currentIndex = index;
        currentTranslate = -currentIndex * slideWidth;
        prevTranslate = currentTranslate;
        slider.style.transition = 'transform 0.4s ease-in-out';
        setSliderPosition();
        updateDots();
    }
    function createDots() {
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }
    function updateDots() {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    function swipeStart(event) {
        if (event.target.classList.contains('draggable-text') || event.target.classList.contains('slide-arrow')) return;
        isSwiping = true;
        startX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        slider.style.transition = 'none';
        cardPreview.style.cursor = 'grabbing';
    }
    function swipeMove(event) {
        if (!isSwiping) return;
        const currentX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        setSliderPosition();
    }
    function swipeEnd() {
        if (!isSwiping) return;
        isSwiping = false;
        cardPreview.style.cursor = 'grab';
        const movedBy = currentTranslate - prevTranslate;
        let newIndex = currentIndex;
        if (movedBy < -100 && currentIndex < slides.length - 1) newIndex++;
        if (movedBy > 100 && currentIndex > 0) newIndex--;
        goToSlide(newIndex);
    }
    cardPreview.addEventListener('mousedown', swipeStart);
    cardPreview.addEventListener('touchstart', swipeStart);
    document.addEventListener('mouseup', swipeEnd);
    document.addEventListener('touchend', swipeEnd);
    document.addEventListener('mouseleave', swipeEnd);
    document.addEventListener('mousemove', swipeMove);
    document.addEventListener('touchmove', swipeMove);
    prevArrow.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextArrow.addEventListener('click', () => goToSlide(currentIndex + 1));

    const controls = {
        fontFamily: document.getElementById('font-family'),
        fontSize: document.getElementById('font-size'),
        fontColor: document.getElementById('font-color'),
        toggleBold: document.getElementById('toggle-bold'),
        toggleShadow: document.getElementById('toggle-shadow'),
        alignLeft: document.getElementById('align-left'),
        alignCenter: document.getElementById('align-center'),
        alignRight: document.getElementById('align-right'),
        rotation: document.getElementById('rotation'),
        letterSpacing: document.getElementById('letter-spacing'),
    };
    let activeTextElement = null;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let textElementCounter = 3;

    function updateToolbar(element) {
        if (!element) return;
        const style = window.getComputedStyle(element);

        const fontName = style.fontFamily.split(',')[0].replace(/"/g, '').trim();
        const selectedOption = Array.from(controls.fontFamily.options).find(opt => opt.text === fontName);
        if (selectedOption) {
            controls.fontFamily.value = selectedOption.value;
        }

        controls.fontSize.value = parseInt(style.fontSize, 10);
        controls.fontColor.value = rgbToHex(style.color);
        controls.letterSpacing.value = parseFloat(style.letterSpacing) || 0;
        const transform = style.transform;
        const rotationMatch = transform.match(/rotate\((.+)deg\)/);
        controls.rotation.value = rotationMatch ? parseFloat(rotationMatch[1]) : 0;
        document.querySelectorAll('.button-group button[id^="align-"]').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`align-${style.textAlign}`).classList.add('active');
        controls.toggleBold.classList.toggle('active', style.fontWeight === '700' || style.fontWeight === 'bold');
        controls.toggleShadow.classList.toggle('active', style.textShadow !== 'none');
    }
    
    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return '#000000';
        let sep = rgb.indexOf(",") > -1 ? "," : " ";
        rgb = rgb.substr(4).split(")")[0].split(sep);
        let r = (+rgb[0]).toString(16), g = (+rgb[1]).toString(16), b = (+rgb[2]).toString(16);
        if (r.length == 1) r = "0" + r;
        if (g.length == 1) g = "0" + g;
        if (b.length == 1) b = "0" + b;
        return "#" + r + g + b;
    }

    function initializeTextElement(el) {
        el.addEventListener('mousedown', (e) => {
            if (el.classList.contains('is-editing')) return;

            e.preventDefault();
            setActiveTextElement(el);
            isDragging = true;
            offsetX = e.clientX - el.getBoundingClientRect().left;
            offsetY = e.clientY - el.getBoundingClientRect().top;
            e.stopPropagation();
        });

        el.addEventListener('dblclick', (e) => {
            el.classList.add('is-editing');
            el.focus();
        });
    }

    document.querySelectorAll('.draggable-text').forEach(initializeTextElement);
    
    document.addEventListener('click', (e) => {
        if (activeTextElement && !activeTextElement.contains(e.target)) {
            activeTextElement.classList.remove('is-editing');
        }
    });

    function setActiveTextElement(element) {
        if (activeTextElement && activeTextElement !== element) {
            activeTextElement.classList.remove('is-editing');
        }
        if (activeTextElement) activeTextElement.classList.remove('active');
        
        activeTextElement = element;

        if (activeTextElement) {
            activeTextElement.classList.add('active');
            updateToolbar(activeTextElement);
        }
    }

    document.addEventListener('mousemove', (e) => {
        if (isDragging && activeTextElement) {
            const parentRect = cardPreview.getBoundingClientRect();
            let x = e.clientX - parentRect.left - offsetX;
            let y = e.clientY - parentRect.top - offsetY;
            x = Math.max(0, Math.min(x, parentRect.width - activeTextElement.offsetWidth));
            y = Math.max(0, Math.min(y, parentRect.height - activeTextElement.offsetHeight));
            activeTextElement.style.left = `${x}px`;
            activeTextElement.style.top = `${y}px`;
            activeTextElement.style.transform = '';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            if (activeTextElement) {
                activeTextElement.style.cursor = 'move';
                const rotation = controls.rotation.value;
                if (rotation !== '0') {
                    applyTransform('rotate', rotation);
                }
            }
            isDragging = false;
        }
    });

    function applyStyle(property, value) {
        if (activeTextElement) activeTextElement.style[property] = value;
    }

    function applyTransform(property, value) {
       if (activeTextElement) {
            let currentRotation = controls.rotation.value;
            if (property === 'rotate') currentRotation = value;
            activeTextElement.style.transform = `rotate(${currentRotation}deg)`;
        }
    }

    controls.fontFamily.addEventListener('change', (e) => applyStyle('fontFamily', e.target.value));
    controls.fontSize.addEventListener('input', (e) => applyStyle('fontSize', `${e.target.value}px`));
    controls.fontColor.addEventListener('input', (e) => applyStyle('color', e.target.value));
    controls.letterSpacing.addEventListener('input', (e) => applyStyle('letterSpacing', `${e.target.value}px`));
    controls.rotation.addEventListener('input', (e) => applyTransform('rotate', e.target.value));
    controls.toggleBold.addEventListener('click', () => {
        if (activeTextElement) {
            const isBold = window.getComputedStyle(activeTextElement).fontWeight === '700';
            applyStyle('fontWeight', isBold ? 'normal' : '700');
            controls.toggleBold.classList.toggle('active');
        }
    });
    controls.toggleShadow.addEventListener('click', () => {
        if (activeTextElement) {
            const hasShadow = window.getComputedStyle(activeTextElement).textShadow !== 'none';
            applyStyle('textShadow', hasShadow ? 'none' : '2px 2px 4px rgba(0,0,0,0.5)');
            controls.toggleShadow.classList.toggle('active');
        }
    });
    ['left', 'center', 'right'].forEach(align => {
        document.getElementById(`align-${align}`).addEventListener('click', () => {
            applyStyle('textAlign', align);
            document.querySelectorAll('.button-group button[id^="align-"]').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`align-${align}`).classList.add('active');
        });
    });
    document.getElementById('add-text-btn').addEventListener('click', () => {
        textElementCounter++;
        const newText = document.createElement('div');
        newText.id = `text${textElementCounter}`;
        newText.className = 'draggable-text';
        newText.setAttribute('contenteditable', 'true');
        newText.textContent = 'New Text';
        newText.style.top = '50%';
        newText.style.left = '50%';
        newText.style.transform = 'translate(-50%, -50%)';
        newText.style.fontSize = '24px';
        cardPreview.appendChild(newText);
        initializeTextElement(newText);
        setActiveTextElement(newText);
    });
    const imageUploadInput = document.getElementById('image-upload');
    document.getElementById('upload-image-btn').addEventListener('click', () => imageUploadInput.click());
    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                slides[currentIndex].querySelector('img').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('download-btn').addEventListener('click', () => {
        if (activeTextElement) {
            activeTextElement.classList.remove('active');
            activeTextElement.classList.remove('is-editing');
        }
        
        html2canvas(cardPreview, { useCORS: true }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'invitation.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (activeTextElement) activeTextElement.classList.add('active');
        });
    });
    
    createDots();
    goToSlide(0);
    setActiveTextElement(document.getElementById('text1'));
});