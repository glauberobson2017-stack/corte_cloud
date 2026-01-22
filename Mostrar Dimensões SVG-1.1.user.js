// ==UserScript==
// @name         Mostrar Dimensões SVG
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Mostra as dimensões dos retângulos SVG com classe 'part' - Funciona em iframe
// @author       Seu Nome
// @match        https://marceneiro.cortecloud.com.br/*
// @match        https://interactiveplan.cortecloud.com/*
// @grant        none
// @run-at       document-end
// @noframes     false
// ==/UserScript==

(function() {
    'use strict';

    // Configuração de debug
    const DEBUG = true;
    const log = DEBUG ? console.log.bind(console, '%c[DIM]', 'color: blue; font-weight: bold') : () => {};

    // Verificar se estamos no iframe ou na página principal
    const isIframe = window.location.hostname === 'interactiveplan.cortecloud.com';
    const isMainPage = window.location.hostname === 'marceneiro.cortecloud.com.br';

    log('Executando script. isIframe:', isIframe, 'isMainPage:', isMainPage);
    log('URL atual:', window.location.href);

    // Função para verificar se a URL atual corresponde ao padrão desejado
    function shouldExecuteScript() {
        const currentUrl = window.location.href;

        // Expressão regular que corresponde apenas à URL desejada
        const paginaoriginal = /https:\/\/marceneiro\.cortecloud\.com\.br\/#\/plans\/\d+\/view$/;
        const paginaiframe = /https:\/\/interactiveplan\.cortecloud\.com\/plans\/\d+/;

        // Verificar se corresponde ao padrão desejado
        if (paginaoriginal.test(currentUrl) || paginaiframe.test(currentUrl)) {
            return true;
        }

        return false;
    }

    // Verificar se deve executar o script
    if (!shouldExecuteScript()) {
        log('URL não corresponde ao padrão esperado. Script não executado.');
        return;
    }

    log('URL validada. Iniciando script...');

    // Se estamos no iframe, iniciar a lógica de dimensões
    if (isIframe) {
        log('Detectado iframe de interactiveplan.cortecloud.com');
        startDimensionsScript();
    } else if (isMainPage) {
        log('Detectada página principal marceneiro.cortecloud.com.br');
        startDimensionsScript();
    }

    function startDimensionsScript() {
        // Aguardar o carregamento completo
        let initialized = false;

        function initializeScript() {
            if (initialized) return;
            initialized = true;

            log('Inicializando script de dimensões...');
            startRectDetection();
            setupKeyboardEvents();
        }

        window.addEventListener('load', function() {
            log('Evento load disparado.');
            setTimeout(initializeScript, 100);
        });

        // Se já estiver carregado
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            log('Documento já em estado:', document.readyState);
            setTimeout(initializeScript, 100);
        }
    }

    let foundRects = [];
    let isShowingDimensions = false;

    function startRectDetection() {
        log('Iniciando detecção de rects...');

        function checkRects() {
            const allRects = document.querySelectorAll('rect.part');
            if (allRects.length > 0) {
                // Filtrar apenas os rects que NÃO estão dentro de um elemento com class="scrap"
                foundRects = Array.from(allRects).filter(rect => {
                    const scrapParent = rect.closest('.scrap');
                    return !scrapParent; // Retorna true se NÃO está dentro de scrap
                });
                
                log(`Encontrados ${foundRects.length} rects com classe "part" (excluindo ${allRects.length - foundRects.length} dentro de .scrap).`);
                updateButton(true);
                return true;
            } else {
                log('Nenhum rect com classe "part" encontrado.');
                return false;
            }
        }

        // Verificação imediata
        // if (!checkRects()) {
        //     // Se não encontrou, tentar novamente após um atraso (pode ser carregamento dinâmico)
        //     setTimeout(checkRects, 1000);
        // }

        // Observar mudanças no DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(checkRects, 100);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }


    function setupKeyboardEvents() {
        log('Configurando eventos de teclado...');

        // Usar capture para garantir que o evento seja capturado
        document.addEventListener('keydown', function(event) {
            log(`Tecla pressionada: ${event.key} (${event.keyCode})`);

            // Tecla Home
            if (event.key === 'Home' || event.keyCode === 36) {
                event.preventDefault();
                event.stopPropagation();
                log('Home pressionada, alternando dimensões.');
                toggleDimensions();
                return;
            }

            // // Alt + D
            // if (event.altKey && event.key.toLowerCase() === 'd') {
            //     event.preventDefault();
            //     event.stopPropagation();
            //     log('Alt+D pressionado, alternando dimensões.');
            //     toggleDimensions();
            //     return;
            // }

            // // Ctrl + Alt + D
            // if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'd') {
            //     event.preventDefault();
            //     event.stopPropagation();
            //     log('Ctrl+Alt+D pressionado, alternando dimensões.');
            //     toggleDimensions();
            //     return;
            // }

            // // Ctrl + Shift + Alt + B (compatibilidade com versão antiga)
            // if (event.ctrlKey && event.shiftKey && event.altKey && event.key.toLowerCase() === 'b') {
            //     event.preventDefault();
            //     event.stopPropagation();
            //     log('Ctrl+Shift+Alt+B pressionado, mostrando dimensões.');
            //     addDimensions();
            //     return;
            // }

            // // Ctrl + Shift + Alt + R (compatibilidade com versão antiga)
            // if (event.ctrlKey && event.shiftKey && event.altKey && event.key.toLowerCase() === 'r') {
            //     event.preventDefault();
            //     event.stopPropagation();
            //     log('Ctrl+Shift+Alt+R pressionado, removendo dimensões.');
            //     removeDimensions();
            //     return;
            // }

            // // T (compatibilidade com versão antiga)
            // if (event.key.toLowerCase() === 't') {
            //     event.preventDefault();
            //     event.stopPropagation();
            //     log('T pressionado, alternando dimensões.');
            //     toggleDimensions();
            //     return;
            // }
        }, { capture: true });



        log(`=== Controles de Dimensões SVG ===`);
        log(`Home → Alternar (show/hide) ✓ RECOMENDADO`);
        // log(`// Alt + D → Alternar (show/hide)`);
        // log(`// Ctrl + Alt + D → Alternar (show/hide)`);
        // log(`// Ctrl + Shift + Alt + B → Mostrar (compatibilidade)`);
        // log(`// Ctrl + Shift + Alt + R → Remover (compatibilidade)`);
        // log(`// T → Alternar (compatibilidade)`);

    }

    function toggleDimensions() {
        if (foundRects.length === 0) {
            log('Nenhum rect para processar.');
            showNotification('Nenhum rect encontrado!', 'error');
            return;
        }

        const hasTexts = document.querySelectorAll('text.dimension-text').length > 0;

        if (hasTexts) {
            removeDimensions();
        } else {
            addDimensions();
        }
    }

    function addDimensions() {
        log(`Adicionando dimensões a ${foundRects.length} rects.`);

        let added = 0;
        foundRects.forEach((rect, index) => {
            try {
                const width = parseFloat(rect.getAttribute('width'));
                const height = parseFloat(rect.getAttribute('height'));
                const x = parseFloat(rect.getAttribute('x')) || 0;
                const y = parseFloat(rect.getAttribute('y')) || 0;

                if (!width || !height) return;

                // Criar ID único
                const textId = `dimension-text-${index}-${Date.now()}`;

                // Remover existente
                const existing = document.getElementById(textId);
                if (existing) existing.remove();

                // Criar elemento de texto
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.id = textId;
                text.classList.add('dimension-text');
                text.setAttribute('pointer-events', 'none');

                // Posicionar no centro do retângulo
                const centerX = x + width / 2;
                const centerY = y + height / 2;
                let fontSize = Math.min(width / 5, height / 1.4, 100);

                text.setAttribute('x', centerX);
                text.setAttribute('y', centerY);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'central');
                   // Verificar se o rect tem classe "rotate" para definir cores com contraste
                   const isRotateRect = rect.classList.contains('rotate');
                   const textColor = isRotateRect ? '#FFFF00' : '#ff0000'; // Amarelo para rotate, vermelho para outros
                   text.setAttribute('fill', textColor);
                text.setAttribute('stroke', '#000000');
                text.setAttribute('stroke-width', '2');
                text.setAttribute('stroke-opacity', '0.7');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('font-family', 'Arial, sans-serif');

                // Rodar 90 graus se height > width
                if (height > width) {
                    // Aumentar fonte quando rotacionado
                    fontSize = Math.min(height / 5, width / 1.2, 100);
                    text.setAttribute('transform', `rotate(90, ${centerX}, ${centerY})`);
                    log(`Rotacionado texto do rect ${index}: height (${Math.round(height)}) > width (${Math.round(width)}), fontSize: ${fontSize}`);
                }

                text.setAttribute('font-size', fontSize);

                text.textContent = `${Math.round(height)} × ${Math.round(width)}`;

                // Adicionar ao SVG
                const svg = rect.closest('svg');
                if (svg) {
                    svg.appendChild(text);
                    added++;
                }
            } catch (e) {
                log(`Erro ao processar rect ${index}:`, e);
            }
        });

        if (added > 0) {
            isShowingDimensions = true;
            log(`Dimensões adicionadas a ${added} rects.`);
            showNotification(`✓ Dimensões exibidas em ${added} peça${added !== 1 ? 's' : ''}.`, 'success');
            updateButton(true);
        }
    }

    function removeDimensions() {
        const texts = document.querySelectorAll('text.dimension-text');
        texts.forEach(text => text.remove());

        isShowingDimensions = false;
        log(`${texts.length} dimensões removidas.`);
        showNotification(`✗ Dimensões removidas (${texts.length} textos).`, 'info');
        updateButton(foundRects.length > 0);
    }

    function showNotification(message, type) {
        // Remove notificação anterior
        const existing = document.getElementById('dimension-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'dimension-notification';
        notification.textContent = message;

        const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3';

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: bgColor,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '6px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: '999999',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'fadeInOut 3s ease-in-out'
        });

        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-20px); }
                15% { opacity: 1; transform: translateY(0); }
                85% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) notification.remove();
            if (style.parentNode) style.remove();
        }, 3000);
    }
})();