import { initAnimations } from './animations.js';
import { t, getContent, initLangToggle } from './i18n.js';

// Use-case gallery + intake-agent chat copy come from the bilingual
// content dictionary in i18n.js (default English, Hebrew via the navbar toggle).
const useCases = getContent().useCases;


// --- Core Functions ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Apply the current language to every static [data-i18n] element
    //    and wire up the navbar language toggle.
    initLangToggle();

    // 2. Initialize scroll/entrance animations (GSAP)
    initAnimations();

    // 3. Render Use Cases
    initUseCasesGallery();

    // 4. Contact Form / Intake Agent
    initContactForm();

    // 5. Mobile Menu Logic
    initMobileMenu();

    // 6. "Talk to our CEO now" / "Check your fit now" CTAs scattered around the
    //    site — jump to the contact section and focus the intake agent's input.
    initAgentCtas();

    // 7. Calculate Initial ROI Values
    setTimeout(() => {
        if (window.calculateROI) window.calculateROI();
    }, 200);

    // 8. Modal backdrop click & ESC key close
    const modal = document.getElementById('use-case-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.closeUseCaseModal();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeUseCaseModal();
        }
    });
});

/**
 * Mobile Navigation Toggle
 */
function initMobileMenu() {
    const toggleBtn = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggleBtn || !navMenu) return;

    // Toggle menu on click
    toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        toggleBtn.innerText = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            toggleBtn.innerText = '☰';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            toggleBtn.innerText = '☰';
        }
    });
}

/**
 * "Talk to our CEO now" / "Check your fit now" — every CTA marked with the
 * .cta-agent class jumps to #contact and puts the cursor straight into the
 * intake agent's chat input, instead of just landing on the section.
 */
function initAgentCtas() {
    document.querySelectorAll('.cta-agent').forEach((el) => {
        el.addEventListener('click', () => {
            setTimeout(() => {
                const input = document.getElementById('agent-input');
                if (input && !input.disabled) input.focus();
            }, 500);
        });
    });
}

/**
 * Renders the Use Cases cards into the Bento Grid.
 */
function initUseCasesGallery() {
    const gallery = document.getElementById('use-cases-gallery');
    if (!gallery) return;

    gallery.innerHTML = useCases.map((useCase) => {
        return `
            <div class="clean-card use-case-card" onclick="openUseCaseModal('${useCase.modalId}')">
                <div class="icon-box-clean">
                    <img src="assets/icons/${useCase.icon}" alt="${useCase.title}" onerror="this.onerror=null; this.src='assets/icons/box.svg'">
                </div>
                <h3>${useCase.title}</h3>
                <p>${useCase.description}</p>
                <div style="margin-top: auto; padding-top: 1rem; font-size: 0.9rem; font-weight: 600; color: var(--primary);">
                    ${t('usecases.readmore')} &rarr;
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Handles the conversational Intake Agent chat & form submission.
 * Steps: name -> organization -> business email -> which process matters most
 * (quick-reply options) -> a free-text field ("tell us a bit about your
 * process", per Founder feedback) -> summary & handoff to Poppy.
 */
async function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const chat = getContent().chat;

    const agentMessages = document.getElementById('agent-messages');
    const agentInput = document.getElementById('agent-input');
    const agentSendBtn = document.getElementById('agent-send-btn');
    const agentTyping = document.getElementById('agent-typing');
    const agentQuickOptions = document.getElementById('agent-quick-options');

    const hiddenName = document.getElementById('hidden-name');
    const hiddenOrg = document.getElementById('hidden-org');
    const hiddenEmail = document.getElementById('hidden-email');
    const hiddenMessage = document.getElementById('hidden-message');
    const hiddenProcessDetails = document.getElementById('hidden-process-details');

    if (!agentMessages || !agentInput || !agentSendBtn) return;

    // Steps: 0 name, 1 org, 2 email, 3 process (quick options), 4 free text, 5 done
    let currentStep = 0;
    const userData = {
        name: '',
        organization: '',
        contact: '',
        message: '',
        processDetails: '',
    };

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `bubble ${sender}`;
        msgDiv.style.maxWidth = '80%';
        msgDiv.style.padding = '0.8rem 1.1rem';
        msgDiv.style.borderRadius = '14px';
        msgDiv.style.fontSize = '0.95rem';
        msgDiv.style.lineHeight = '1.5';
        msgDiv.style.boxShadow = 'var(--shadow-xs)';
        msgDiv.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        msgDiv.style.opacity = '0';
        msgDiv.style.transform = 'translateY(10px)';

        if (sender === 'agent') {
            msgDiv.style.alignSelf = 'flex-start';
            msgDiv.style.background = 'var(--bg-subtle)';
            msgDiv.style.border = '1px solid var(--border-light)';
            msgDiv.style.color = 'var(--text-main)';
        } else {
            msgDiv.style.alignSelf = 'flex-end';
            msgDiv.style.background = 'linear-gradient(135deg, var(--primary), var(--accent))';
            msgDiv.style.color = '#030712';
            msgDiv.style.fontWeight = '500';
        }

        msgDiv.innerText = text;
        agentMessages.appendChild(msgDiv);

        // Trigger reflow & animation
        msgDiv.offsetHeight;
        msgDiv.style.opacity = '1';
        msgDiv.style.transform = 'translateY(0)';

        agentMessages.scrollTop = agentMessages.scrollHeight;
    }

    function showTyping(show) {
        if (agentTyping) {
            agentTyping.style.display = show ? 'flex' : 'none';
            if (show) {
                agentMessages.appendChild(agentTyping);
                agentMessages.scrollTop = agentMessages.scrollHeight;
            }
        }
    }

    async function agentSay(text, delay = 800) {
        showTyping(true);
        await new Promise(r => setTimeout(r, delay));
        showTyping(false);
        appendMessage('agent', text);
    }

    async function nextStep() {
        if (currentStep === 0) {
            await agentSay(chat.welcome);
            await agentSay(chat.askName);
            enableInput(true, chat.namePlaceholder);
        } else if (currentStep === 1) {
            await agentSay(chat.greet(userData.name));
            enableInput(true, chat.orgPlaceholder);
        } else if (currentStep === 2) {
            await agentSay(chat.askEmail);
            enableInput(true, chat.emailPlaceholder);
        } else if (currentStep === 3) {
            await agentSay(chat.askProcess);
            showQuickOptions(chat.quickOptions);
        } else if (currentStep === 4) {
            // Founder feedback: an explicit free-text step, framed simply,
            // so a visitor can describe their process/need in their own words.
            await agentSay(chat.askFreeText);
            enableInput(true, chat.freeTextPlaceholder);
        } else if (currentStep === 5) {
            await agentSay(chat.processing(userData.name));
            showTyping(true);
            await new Promise(r => setTimeout(r, 1500));
            showTyping(false);

            if (hiddenName) hiddenName.value = userData.name;
            if (hiddenOrg) hiddenOrg.value = userData.organization;
            if (hiddenEmail) hiddenEmail.value = userData.contact;
            if (hiddenMessage) hiddenMessage.value = userData.message;
            if (hiddenProcessDetails) hiddenProcessDetails.value = userData.processDetails;

            await agentSay(chat.matchFound);
            await agentSay(chat.followUp);

            form.dispatchEvent(new Event('submit'));
        }
    }

    function enableInput(enable, placeholder = "") {
        agentInput.disabled = !enable;
        agentInput.placeholder = placeholder;
        if (enable) {
            agentInput.focus();
        } else {
            agentInput.value = "";
        }
        agentSendBtn.disabled = !enable;
    }

    function showQuickOptions(options) {
        if (!agentQuickOptions) return;
        agentQuickOptions.innerHTML = '';
        agentQuickOptions.style.display = 'flex';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quick-option-btn';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--bg-card)';
            btn.style.border = '1px solid var(--border-light)';
            btn.style.borderRadius = '100px';
            btn.style.color = 'var(--text-muted)';
            btn.style.fontSize = '0.85rem';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';

            btn.addEventListener('mouseover', () => {
                btn.style.borderColor = 'var(--primary)';
                btn.style.color = 'var(--text-main)';
                btn.style.background = 'var(--accent-glow)';
            });
            btn.addEventListener('mouseout', () => {
                btn.style.borderColor = 'var(--border-light)';
                btn.style.color = 'var(--text-muted)';
                btn.style.background = 'var(--bg-card)';
            });

            btn.addEventListener('click', () => {
                agentQuickOptions.style.display = 'none';
                handleUserInput(opt);
            });
            agentQuickOptions.appendChild(btn);
            btn.innerText = opt;
        });

        enableInput(true, chat.quickOptionsPlaceholder);
    }

    function handleUserInput(text) {
        if (!text.trim()) return;

        appendMessage('user', text);
        enableInput(false);

        if (currentStep === 0) {
            userData.name = text;
            currentStep = 1;
            nextStep();
        } else if (currentStep === 1) {
            userData.organization = text;
            currentStep = 2;
            nextStep();
        } else if (currentStep === 2) {
            if (!text.includes('@') || !text.includes('.')) {
                agentSay(chat.emailInvalid).then(() => {
                    enableInput(true, chat.emailPlaceholder);
                });
            } else {
                userData.contact = text;
                currentStep = 3;
                nextStep();
            }
        } else if (currentStep === 3) {
            userData.message = text;
            currentStep = 4;
            nextStep();
        } else if (currentStep === 4) {
            userData.processDetails = text;
            currentStep = 5;
            nextStep();
        }
    }

    agentSendBtn.addEventListener('click', () => {
        const val = agentInput.value;
        if (!val.trim()) return;
        agentInput.value = '';
        handleUserInput(val);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: userData.name,
            organization: userData.organization,
            contact: userData.contact,
            message: userData.message,
            process_details: userData.processDetails,
            // Honeypot: a real visitor never sees or fills this, so any value server-side
            // marks the submit as spam. Sent empty here on purpose.
            _gotcha: ''
        };

        try {
            // Owned lead-intake endpoint (Issue #214), a Vercel serverless function on the
            // existing poworg-control-tower project. Replaces the broken FormSubmit AJAX path
            // (Issue #208: FormSubmit's slash-alias 404'd on the CORS preflight, so leads were
            // silently lost). No recipient mailbox address appears here or anywhere in client
            // JS — the endpoint opens a lead Issue and notifies the Founder server-side.
            const response = await fetch('https://poworg-control-tower.vercel.app/api/lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // The endpoint returns 2xx only when the lead was actually persisted (Issue filed +
            // Founder notification queued). A missing/invalid server PAT fails loud with 503, so
            // response.ok is an honest success signal — no silent-drop path here.
            if (response.ok) {
                showSuccessToast(chat.successToastTitle, chat.successToastBody);
            } else {
                throw new Error('Lead endpoint status ' + response.status);
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            await agentSay(chat.submitError);
        }
    });

    nextStep();
}

function showSuccessToast(title, message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.insetInlineEnd = '2rem';
    toast.style.background = 'rgba(8, 145, 178, 0.15)';
    toast.style.backdropFilter = 'blur(12px)';
    toast.style.border = '1px solid rgba(8, 145, 178, 0.3)';
    toast.style.color = 'var(--primary)';
    toast.style.padding = '1.25rem 2.25rem';
    toast.style.borderRadius = '16px';
    toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.6)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '1.05rem';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '14px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(30px)';
    toast.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    toast.innerHTML = `
        <span style="font-size: 1.5rem; color: var(--primary); font-weight: 700;">&#10003;</span>
        <div>
            <strong style="color: #ffffff; font-weight: 700;">${title}</strong>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px;">${message}</div>
        </div>
    `;

    document.body.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;

    // Fade in
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    // Fade out after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(30px)';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4500);
}


// --- Global Modal Helpers ---

function getCaseStudyHtml(useCase) {
    const metricsHtml = useCase.metrics.map((m, i) => {
        const colors = ['var(--primary)', 'var(--primary)', 'var(--accent)'];
        const bgs = ['rgba(8, 145, 178, 0.06)', 'rgba(8, 145, 178, 0.06)', 'rgba(14, 116, 144, 0.06)'];
        const borders = ['rgba(8, 145, 178, 0.15)', 'rgba(8, 145, 178, 0.15)', 'rgba(14, 116, 144, 0.15)'];
        return `<div style="text-align: center; padding: 1.5rem; background: ${bgs[i]}; border: 1px solid ${borders[i]}; border-radius: 12px;">
            <div style="font-size: 1.6rem; font-weight: 800; color: ${colors[i]}; margin-bottom: 0.25rem;">${m.value}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${m.label}</div>
        </div>`;
    }).join('');

    const solutionsHtml = useCase.solutions.map(s =>
        `<li style="display: flex; align-items: center; gap: 10px; font-size: 1rem; color: var(--text-main);"><span style="color: var(--primary); font-weight: 700;">&#10003;</span> ${s}</li>`
    ).join('');

    return `
        <div class="case-study">
            <p style="margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6; color: var(--text-light);">${useCase.description}</p>
            <div style="margin-bottom: 2rem;">
                <h4 style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem; letter-spacing: 0.02em;">${t('usecase.modal.challenge')}</h4>
                <p style="font-size: 1.05rem; color: var(--text-main); line-height: 1.7; margin: 0;">${useCase.challenge}</p>
            </div>
            <div style="margin-bottom: 2rem;">
                <h4 style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem; letter-spacing: 0.02em;">${t('usecase.modal.solution')}</h4>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                    ${solutionsHtml}
                </ul>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                ${metricsHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); border-radius: 10px; margin-bottom: 2rem;">
                <span style="font-size: 1.1rem; color: var(--primary);">&#9679;</span>
                <span style="font-size: 0.9rem; color: var(--text-muted);">${useCase.security}</span>
            </div>
            <a href="#contact" onclick="closeUseCaseModal()" class="btn btn-primary cta-agent" style="width: 100%; padding: 1rem; font-size: 1.05rem;">${t('usecase.modal.cta')}</a>
        </div>
    `;
}


window.openUseCaseModal = function (modalId) {
    const useCase = useCases.find((u) => u.modalId === modalId);
    if (!useCase) return;

    const modal = document.getElementById('use-case-modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('span');

    if (modal && modalBody) {
        modalTitle.innerText = useCase.title;
        modalBody.innerHTML = getCaseStudyHtml(useCase);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // The CTA rendered inside the modal also needs the CTA-focus wiring.
        const cta = modalBody.querySelector('.cta-agent');
        if (cta) {
            cta.addEventListener('click', () => {
                setTimeout(() => {
                    const input = document.getElementById('agent-input');
                    if (input && !input.disabled) input.focus();
                }, 500);
            });
        }
    }
};


window.closeUseCaseModal = function () {
    const modal = document.getElementById('use-case-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};


// --- ROI Calculator Logic ---
window.calculateROI = function () {
    const employeesSlider = document.getElementById('employees-slider');
    const hoursSlider = document.getElementById('hours-slider');
    const wageSlider = document.getElementById('wage-slider');
    const autoSlider = document.getElementById('auto-slider');

    if (!employeesSlider || !hoursSlider || !wageSlider || !autoSlider) return;

    const employees = parseInt(employeesSlider.value);
    const hours = parseInt(hoursSlider.value);
    const wage = parseInt(wageSlider.value);
    const autoPercent = parseInt(autoSlider.value) / 100;

    // Calculations
    const weeklyHoursSaved = employees * hours * autoPercent;
    const annualHoursSaved = Math.round(weeklyHoursSaved * 52);
    const annualSavings = Math.round(annualHoursSaved * wage);

    // Update value displays
    document.getElementById('val-employees').innerText = employees;
    document.getElementById('val-hours').innerText = hours;
    document.getElementById('val-wage').innerText = `₪ ${wage}`;
    document.getElementById('val-auto').innerText = `${autoSlider.value}%`;

    // Update result displays
    document.getElementById('roi-annual-savings').innerText = `₪ ${annualSavings.toLocaleString()}`;
    document.getElementById('roi-hours-saved').innerText = `${annualHoursSaved.toLocaleString()} ${t('roi.hours.unit')}`;

    // Payback period display based on savings size
    const paybackDisp = document.getElementById('roi-payback');
    if (annualSavings > 1500000) {
        paybackDisp.innerText = t('roi.payback.fast');
        paybackDisp.style.background = 'linear-gradient(135deg, var(--primary), var(--primary))';
    } else if (annualSavings > 750000) {
        paybackDisp.innerText = t('roi.payback.mid');
        paybackDisp.style.background = 'linear-gradient(135deg, #3b82f6, var(--primary))';
    } else {
        paybackDisp.innerText = t('roi.payback.slow');
        paybackDisp.style.background = 'linear-gradient(135deg, #8b5cf6, #c084fc)';
    }
    paybackDisp.style.webkitBackgroundClip = 'text';
    paybackDisp.style.webkitTextFillColor = 'transparent';
};
