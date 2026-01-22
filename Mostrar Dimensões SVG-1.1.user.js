// ==UserScript==
// @name         Mostrar Dimensões SVG
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Mostra as dimensões dos retângulos SVG com classe 'part' ao pressionar Ctrl+Shift+Alt+B
// @author       Seu Nome
// @match        https://marceneiro.cortecloud.com.br/*
// @match        https://interactiveplan.cortecloud.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

     // Função para verificar se a URL atual corresponde ao padrão desejado
    function shouldExecuteScript() {
        const currentUrl = window.location.href;

        // Expressão regular que corresponde apenas à URL desejada
        // Pattern: /#/plans/{número}/view
        const paginaoriginal = /https:\/\/marceneiro\.cortecloud\.com\.br\/#\/plans\/\d+\/view$/;
        const paginaiframe = /https:\/\/interactiveplan\.cortecloud\.com\/plans\/\d+$/;
        
        // Verificar se corresponde ao padrão desejado
        if (paginaoriginal.test(currentUrl) || paginaiframe.test(currentUrl)) {
            return true;
        }

        return false;
    }

    // Verificar se deve executar o script
    if (!shouldExecuteScript()) {
        return; // Sai do script se não for a URL correta
    }


    let taxa_tam = 0
    let font_tampanho
    // Aguarda o carregamento completo da página
    window.addEventListener('load', function() {
        console.log('Script de dimensões SVG carregado.');

        // Função para adicionar as dimensões
        function adicionarDimensoes() {
            const rects = document.querySelectorAll('rect.part');
            let contador = 0;

            rects.forEach(function(rect) {
                const height = rect.getAttribute('height');
                const width = rect.getAttribute('width');

                if (!height || !width) return;

                // Verifica se já tem texto de dimensões
                const existingTextId = `dimension-text-${contador}`;
                let textElement = document.getElementById(existingTextId);

                if (!textElement) {
                    // Cria elemento de texto SVG
                    textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    textElement.setAttribute('id', existingTextId);
                    textElement.setAttribute('class', 'dimension-text');
                    textElement.setAttribute('pointer-events', 'none');

                    // Encontra o grupo SVG mais próximo
                    const svgGroup = rect.closest('svg') || document.querySelector('svg');
                    if (svgGroup) {
                        svgGroup.appendChild(textElement);
                    }
                }

                // Calcula posição
                const rectX = parseFloat(rect.getAttribute('x')) || 0;
                const rectY = parseFloat(rect.getAttribute('y')) || 0;
                const rectWidth = parseFloat(width);
                const rectHeight = parseFloat(height);

                // Centraliza o texto
                const centerX = rectX + (rectWidth / 2);
                const centerY = rectY + (rectHeight / 2);

                // Configura o texto
                font_tampanho = Math.min(rectWidth / 5 , rectHeight / 1.8, 60)
                textElement.setAttribute('x', centerX);
                textElement.setAttribute('y', centerY);
                textElement.setAttribute('text-anchor', 'middle');
                textElement.setAttribute('dominant-baseline', 'central');
                textElement.setAttribute('fill', '#000000');
                textElement.setAttribute('stroke', '#FFFFFF');
                textElement.setAttribute('stroke-width', '2');
                textElement.setAttribute('stroke-opacity', '0.7');
                textElement.setAttribute('font-size', font_tampanho);
                console.warn(font_tampanho)
                textElement.setAttribute('font-weight', 'bold');
                textElement.textContent = `${Math.round(rectHeight)} × ${Math.round(rectWidth)}`;

                contador++;
            });

            console.log(`Dimensões adicionadas a ${contador} retângulos.`);
            if (contador > 0) {
                showNotification(`✓ Dimensões exibidas em ${contador} partes`);
            }
        }

        // Função para remover as dimensões
        function removerDimensoes() {
            const textos = document.querySelectorAll('text.dimension-text');
            textos.forEach(function(texto) {
                texto.remove();
            });
            console.log(`Dimensões removidas (${textos.length} textos).`);
            if (textos.length > 0) {
                showNotification(`✗ Dimensões removidas`);
            }
        }

        // Função para notificação visual
        function showNotification(message) {
            // Remove notificação anterior se existir
            const notifAntiga = document.getElementById('svg-dimension-notification');
            if (notifAntiga) notifAntiga.remove();

            // Cria nova notificação
            const notification = document.createElement('div');
            notification.id = 'svg-dimension-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 999999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: fadeInOut 3s ease-in-out;
            `;

            // Adiciona estilo para animação
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);

            notification.textContent = message;
            document.body.appendChild(notification);

            // Remove automaticamente após 3 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                if (style.parentNode) {
                    style.remove();
                }
            }, 3000);
        }

        // Adiciona evento de teclado
        document.addEventListener('keydown', function(event) {
            console.log(event)
            // Ctrl + Shift + Alt + B
            if (event.ctrlKey && event.shiftKey && event.altKey && event.key.toLowerCase() === 'b') {
                event.preventDefault();
                adicionarDimensoes();
                return;
            }

            // Ctrl + Shift + Alt + R
            if (event.ctrlKey && event.shiftKey && event.altKey && event.key.toLowerCase() === 'r') {
                event.preventDefault();
                removerDimensoes();
                return;
            }

            // Ctrl + Shift + Alt + T (toggle)
            if (event.ctrlKey && event.shiftKey && event.altKey && event.key.toLowerCase() === 't') {
                event.preventDefault();
                const hasTexts = document.querySelectorAll('text.dimension-text').length > 0;
                if (hasTexts) {
                    removerDimensoes();
                } else {
                    adicionarDimensoes();
                }
                return;
                console.log("T")
            }

        });

        // Log de ajuda no console
        console.log(`
            === Controles de Dimensões SVG ===
            Ctrl + Shift + Alt + B → Mostrar dimensões
            Ctrl + Shift + Alt + R → Remover dimensões
            Ctrl + Shift + Alt + T → Alternar (show/hide)
        `);
    });
})();