// ============================================
// PAYMENT.JS - Sistema de Pagamento
// ============================================

const Payment = {
    metodoSelecionado: 'cartao',
    descontoAplicado: 0,
    cupomAplicado: null,

    abrirPagamento: function() {
        if (!Bravado.state.usuarioAtual) {
            Bravado.utils.mostrarMensagem('🔐 Faça login para finalizar!', 'erro');
            window.auth.abrirModalLogin();
            return;
        }
        
        if (Bravado.state.carrinho.length === 0) {
            Bravado.utils.mostrarMensagem('Carrinho vazio!', 'erro');
            return;
        }
        
        this.metodoSelecionado = 'cartao';
        this.descontoAplicado = 0;
        this.cupomAplicado = null;
        
        const cupomInput = document.getElementById('cupom-input');
        if (cupomInput) cupomInput.value = '';
        
        this.selecionarMetodo('cartao');
        this.atualizarResumoPedido();
        this.atualizarParcelas();
        
        document.getElementById('modal-pagamento').classList.add('active');
    },

    fecharPagamento: function() {
        document.getElementById('modal-pagamento').classList.remove('active');
    },

    selecionarMetodo: function(metodo) {
        this.metodoSelecionado = metodo;
        
        document.querySelectorAll('.metodo-pagamento').forEach(el => {
            el.classList.remove('selecionado');
        });
        const metodoEl = document.getElementById(`metodo-${metodo}`);
        if (metodoEl) metodoEl.classList.add('selecionado');
        
        document.querySelectorAll('.forma-pagamento').forEach(el => {
            el.classList.remove('active');
        });
        const formaEl = document.getElementById(`forma-${metodo}`);
        if (formaEl) formaEl.classList.add('active');
    },

    atualizarResumoPedido: function() {
        const resumo = document.getElementById('resumo-pedido');
        const total = window.cart.calcularTotal();
        const totalComDesconto = total * (1 - this.descontoAplicado);
        
        let html = '<h3>Resumo do Pedido</h3>';
        
        Bravado.state.carrinho.forEach(item => {
            html += `
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <span>${item.nome} x${item.quantidade}</span>
                    <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
            `;
        });
        
        if (this.descontoAplicado > 0) {
            html += `
                <div style="display: flex; justify-content: space-between; color: #28a745;">
                    <span>Desconto (${this.cupomAplicado})</span>
                    <span>-R$ ${(total * this.descontoAplicado).toFixed(2)}</span>
                </div>
            `;
        }
        
        html += `
            <div style="font-size: 1.3rem; font-weight: bold; margin-top: 15px; text-align: right;">
                Total: R$ ${totalComDesconto.toFixed(2)}
            </div>
        `;
        
        resumo.innerHTML = html;
    },

    atualizarParcelas: function() {
        const parcelasSelect = document.getElementById('parcelas-cartao');
        if (!parcelasSelect) return;
        
        const total = window.cart.calcularTotal() * (1 - this.descontoAplicado);
        
        parcelasSelect.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const valorParcela = total / i;
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}x de R$ ${valorParcela.toFixed(2)} (sem juros)`;
            parcelasSelect.appendChild(option);
        }
    },

    aplicarCupom: function() {
        const cupom = document.getElementById('cupom-input').value.toUpperCase();
        
        const cupons = {
            'BRAVADO10': 0.10,
            'BRAVADO20': 0.20,
            'CERVEJA15': 0.15
        };
        
        if (cupons[cupom]) {
            this.descontoAplicado = cupons[cupom];
            this.cupomAplicado = cupom;
            Bravado.utils.mostrarMensagem(`🎉 Cupom aplicado! ${this.descontoAplicado * 100}% off`, 'sucesso');
            this.atualizarResumoPedido();
            this.atualizarParcelas();
        } else {
            Bravado.utils.mostrarMensagem('❌ Cupom inválido!', 'erro');
        }
    },

    formatarCartao: function(input) {
        let valor = input.value.replace(/\D/g, '');
        valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
        input.value = valor;
        document.getElementById('cartao-numero').textContent = valor || '**** **** **** ****';
    },

    formatarValidade: function(input) {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length >= 2) {
            valor = valor.substring(0,2) + '/' + valor.substring(2,4);
        }
        input.value = valor;
        document.getElementById('cartao-validade').textContent = valor || '**/****';
    },

    atualizarNomeCartao: function(input) {
        document.getElementById('cartao-nome').textContent = input.value.toUpperCase() || 'SEU NOME';
    },

    validarCVV: function(input) {
        input.value = input.value.replace(/\D/g, '').substring(0, 3);
    },

    copiarPix: function() {
        const input = document.getElementById('pix-codigo');
        input.select();
        document.execCommand('copy');
        Bravado.utils.mostrarMensagem('📋 Código PIX copiado!', 'sucesso');
    },

    gerarBoleto: function() {
        Bravado.utils.mostrarMensagem('📄 Boleto gerado! Verifique seu e-mail.', 'sucesso');
    },

    processarPagamentoCartao: async function() {
        const cartao = document.getElementById('cartao-input').value.replace(/\s/g, '');
        const nome = document.getElementById('nome-cartao').value;
        const validade = document.getElementById('validade-cartao').value;
        const cvv = document.getElementById('cvv-cartao').value;
        
        if (!cartao || cartao.length < 16) {
            Bravado.utils.mostrarMensagem('❌ Número do cartão inválido!', 'erro');
            return;
        }
        
        if (!nome) {
            Bravado.utils.mostrarMensagem('❌ Nome no cartão é obrigatório!', 'erro');
            return;
        }
        
        if (!validade || validade.length < 5) {
            Bravado.utils.mostrarMensagem('❌ Data de validade inválida!', 'erro');
            return;
        }
        
        if (!cvv || cvv.length < 3) {
            Bravado.utils.mostrarMensagem('❌ CVV inválido!', 'erro');
            return;
        }
        
        await this.finalizarPagamento('Cartão de Crédito');
    },

    processarPagamentoPix: async function() {
        await this.finalizarPagamento('PIX');
    },

    processarPagamentoBoleto: async function() {
        await this.finalizarPagamento('Boleto');
    },

    finalizarPagamento: async function(metodo) {
        Bravado.utils.mostrarLoading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const total = window.cart.calcularTotal() * (1 - this.descontoAplicado);
            
            const pedido = {
                id: Date.now(),
                data: new Date().toLocaleString('pt-BR'),
                itens: [...Bravado.state.carrinho],
                total,
                metodo: metodo,
                status: 'pago',
                cupom: this.cupomAplicado
            };
            
            const usuarioIndex = Bravado.state.usuarios.findIndex(u => u.id === Bravado.state.usuarioAtual.id);
            if (usuarioIndex !== -1) {
                if (!Bravado.state.usuarios[usuarioIndex].historicoPedidos) {
                    Bravado.state.usuarios[usuarioIndex].historicoPedidos = [];
                }
                Bravado.state.usuarios[usuarioIndex].historicoPedidos.unshift(pedido);
                Bravado.state.usuarios[usuarioIndex].pontosFidelidade = (Bravado.state.usuarios[usuarioIndex].pontosFidelidade || 0) + Math.floor(total);
                localStorage.setItem('usuariosBravado', JSON.stringify(Bravado.state.usuarios));
            }
            
            Bravado.utils.mostrarMensagem(`✅ Pagamento aprovado via ${metodo}! Total: R$ ${total.toFixed(2)}`, 'sucesso');
            
            Bravado.state.carrinho = [];
            window.cart.salvarCarrinho();
            window.cart.atualizarContador();
            this.fecharPagamento();
            Bravado.navegacao.mostrarPagina('profile');
            
        } catch (error) {
            Bravado.utils.mostrarMensagem('❌ Erro no pagamento!', 'erro');
        } finally {
            Bravado.utils.mostrarLoading(false);
        }
    }
};

window.payment = Payment;