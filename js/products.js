// ============================================
// PRODUCTS.JS - Catálogo de Cervejas
// ============================================

const Products = {
    cervejas: [
        {
            id: 1,
            estilo: 'IPA',
            nome: 'BRAVADO IPA',
            descricao: 'Amargor marcante e aromas cítricos. 65 IBU, 6.5% ABV.',
            icone: '🍊',
            opcoes: [
                { tipo: 'garrafa', tamanho: '500ml', preco: 24.90 },
                { tipo: 'growler', tamanho: '1L', preco: 42.90 }
            ]
        },
        {
            id: 2,
            estilo: 'PILSEN',
            nome: 'BRAVADO PILSEN',
            descricao: 'Leve e refrescante. 25 IBU, 4.8% ABV.',
            icone: '🌾',
            opcoes: [
                { tipo: 'garrafa', tamanho: '500ml', preco: 19.90 },
                { tipo: 'growler', tamanho: '1L', preco: 34.90 }
            ]
        },
        {
            id: 3,
            estilo: 'TRIGO',
            nome: 'BRAVADO WEISS',
            descricao: 'Notas de banana e cravo. 15 IBU, 5.2% ABV.',
            icone: '🍌',
            opcoes: [
                { tipo: 'garrafa', tamanho: '500ml', preco: 22.90 },
                { tipo: 'growler', tamanho: '1L', preco: 39.90 }
            ]
        },
        {
            id: 4,
            estilo: 'DUBBEL',
            nome: 'BRAVADO DUBBEL',
            descricao: 'Escura e encorpada. 20 IBU, 7.0% ABV.',
            icone: '🍫',
            opcoes: [
                { tipo: 'garrafa', tamanho: '500ml', preco: 29.90 },
                { tipo: 'growler', tamanho: '1L', preco: 52.90 }
            ]
        }
    ],

    renderizarCervejas: function() {
        const container = document.getElementById('lista-cervejas');
        if (!container) return;
        
        Bravado.state.produtos = this.cervejas;
        container.innerHTML = '';
        
        this.cervejas.forEach(cerveja => {
            if (!Bravado.state.opcoesSelecionadas[cerveja.id]) {
                Bravado.state.opcoesSelecionadas[cerveja.id] = 'garrafa';
            }
            
            const card = document.createElement('div');
            card.className = 'cerveja-card';
            
            let opcoesHtml = '';
            cerveja.opcoes.forEach(opcao => {
                const selecionada = Bravado.state.opcoesSelecionadas[cerveja.id] === opcao.tipo ? 'selecionada' : '';
                opcoesHtml += `
                    <div class="opcao-embalagem ${selecionada}" onclick="window.products.selecionarOpcao(${cerveja.id}, '${opcao.tipo}')">
                        <div class="tamanho">${opcao.tamanho}</div>
                        <div class="preco">R$ ${opcao.preco.toFixed(2)}</div>
                    </div>
                `;
            });
            
            card.innerHTML = `
                <div class="cerveja-imagem">
                    <span>${cerveja.icone}</span>
                    <div class="cerveja-tipo">${cerveja.estilo}</div>
                </div>
                <div class="cerveja-info">
                    <h3 class="cerveja-nome">${cerveja.nome}</h3>
                    <p class="cerveja-descricao">${cerveja.descricao}</p>
                    <div class="opcoes-embalagem">
                        ${opcoesHtml}
                    </div>
                    <button class="btn-adicionar" onclick="window.cart.adicionarAoCarrinho(${cerveja.id})">
                        🛒 Adicionar ao Carrinho
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    selecionarOpcao: function(cervejaId, tipo) {
        Bravado.state.opcoesSelecionadas[cervejaId] = tipo;
        this.renderizarCervejas();
    }
};

window.products = Products;