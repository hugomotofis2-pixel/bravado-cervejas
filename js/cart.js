// ============================================
// CART.JS - Gerenciamento do Carrinho
// ============================================

const Cart = {
    adicionarAoCarrinho: function(cervejaId) {
        if (!Bravado.state.usuarioAtual) {
            Bravado.utils.mostrarMensagem('🔐 Faça login para comprar!', 'erro');
            window.auth.abrirModalLogin();
            return;
        }
        
        const cerveja = window.products.cervejas.find(c => c.id === cervejaId);
        const tipoSelecionado = Bravado.state.opcoesSelecionadas[cervejaId] || 'garrafa';
        const opcao = cerveja.opcoes.find(o => o.tipo === tipoSelecionado);
        
        const itemKey = `${cervejaId}-${tipoSelecionado}`;
        const itemExistente = Bravado.state.carrinho.find(item => item.key === itemKey);
        
        if (itemExistente) {
            itemExistente.quantidade++;
            Bravado.utils.mostrarMensagem(`➕ Mais um(a) ${cerveja.nome} adicionado!`, 'sucesso');
        } else {
            Bravado.state.carrinho.push({
                key: itemKey,
                nome: `${cerveja.nome} (${opcao.tamanho})`,
                preco: opcao.preco,
                quantidade: 1
            });
            Bravado.utils.mostrarMensagem(`🍺 ${cerveja.nome} adicionado!`, 'sucesso');
        }
        
        this.salvarCarrinho();
        this.atualizarContador();
    },

    salvarCarrinho: function() {
        localStorage.setItem('carrinhoBravado', JSON.stringify(Bravado.state.carrinho));
    },

    atualizarContador: function() {
        const total = Bravado.state.carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        const contador = document.getElementById('carrinho-count');
        if (contador) contador.textContent = total;
    },

    renderizarCarrinho: function() {
        const container = document.getElementById('carrinho-itens');
        const totalSpan = document.getElementById('total-valor');
        
        if (!container) return;
        
        if (Bravado.state.carrinho.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;">🛒 Seu carrinho está vazio</div>';
            if (totalSpan) totalSpan.textContent = 'R$ 0,00';
            return;
        }
        
        let html = '';
        Bravado.state.carrinho.forEach(item => {
            html += `
                <div class="carrinho-item">
                    <div>
                        <h3>${item.nome}</h3>
                    </div>
                    <div>R$ ${(item.preco * item.quantidade).toFixed(2)}</div>
                    <div class="carrinho-item-acoes">
                        <button onclick="window.cart.alterarQuantidade('${item.key}', 'diminuir')">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="window.cart.alterarQuantidade('${item.key}', 'aumentar')">+</button>
                        <button class="remover" onclick="window.cart.removerDoCarrinho('${item.key}')">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        if (totalSpan) totalSpan.textContent = `R$ ${this.calcularTotal().toFixed(2)}`;
    },

    calcularTotal: function() {
        return Bravado.state.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    },

    alterarQuantidade: function(itemKey, acao) {
        const item = Bravado.state.carrinho.find(i => i.key === itemKey);
        if (!item) return;
        
        if (acao === 'aumentar') {
            item.quantidade++;
        } else if (acao === 'diminuir') {
            if (item.quantidade > 1) {
                item.quantidade--;
            } else {
                this.removerDoCarrinho(itemKey);
                return;
            }
        }
        
        this.salvarCarrinho();
        this.atualizarContador();
        this.renderizarCarrinho();
    },

    removerDoCarrinho: function(itemKey) {
        Bravado.state.carrinho = Bravado.state.carrinho.filter(i => i.key !== itemKey);
        this.salvarCarrinho();
        this.atualizarContador();
        this.renderizarCarrinho();
        Bravado.utils.mostrarMensagem('🗑️ Item removido', 'sucesso');
    },

    limparCarrinho: function() {
        if (Bravado.state.carrinho.length === 0) {
            Bravado.utils.mostrarMensagem('Carrinho já vazio!', 'erro');
            return;
        }
        Bravado.state.carrinho = [];
        this.salvarCarrinho();
        this.atualizarContador();
        this.renderizarCarrinho();
        Bravado.utils.mostrarMensagem('🧹 Carrinho limpo!', 'sucesso');
    }
};

window.cart = Cart;