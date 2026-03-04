// ============================================
// PROFILE.JS - Perfil e Histórico do Usuário
// ============================================

const Profile = {
    carregarPerfil: function() {
        if (!Bravado.state.usuarioAtual) {
            Bravado.navegacao.mostrarPagina('home');
            return;
        }
        
        document.getElementById('perfil-nome').textContent = Bravado.state.usuarioAtual.nome;
        document.getElementById('perfil-email').textContent = Bravado.state.usuarioAtual.email;
        document.getElementById('perfil-data').textContent = 
            new Date(Bravado.state.usuarioAtual.dataCadastro).toLocaleDateString('pt-BR');
        
        this.carregarHistorico();
        this.atualizarFidelidade();
    },

    carregarHistorico: function() {
        const historicoDiv = document.getElementById('historico-pedidos');
        const pedidos = Bravado.state.usuarioAtual.historicoPedidos || [];
        
        if (pedidos.length === 0) {
            historicoDiv.innerHTML = '<p style="text-align: center;">Nenhum pedido ainda.</p>';
        } else {
            historicoDiv.innerHTML = pedidos.map(p => `
                <div class="pedido-card">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Pedido #${p.id}</span>
                        <span>${p.data}</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Total:</strong> R$ ${p.total.toFixed(2)} (${p.metodo})
                    </div>
                    <div>
                        <span style="background-color: #28a745; color: white; padding: 5px 15px; border-radius: 20px;">Pago</span>
                    </div>
                </div>
            `).join('');
        }
    },

    atualizarFidelidade: function() {
        const pontos = Bravado.state.usuarioAtual.pontosFidelidade || 0;
        const progresso = (pontos % 100) / 100 * 100;
        document.getElementById('fidelidade-progresso').style.width = `${progresso}%`;
        
        if (pontos >= 100) {
            const descontos = Math.floor(pontos / 100);
            document.getElementById('fidelidade-texto').textContent = 
                `🎉 Você tem ${descontos} descontos de R$ 10 disponíveis!`;
        } else {
            const faltam = 100 - (pontos % 100);
            document.getElementById('fidelidade-texto').textContent = 
                `💰 Faltam R$ ${faltam} para ganhar R$ 10 de desconto!`;
        }
    },

    avaliar: function(nota) {
        const estrelas = document.querySelectorAll('#estrelas-avaliacao span');
        const texto = document.getElementById('avaliacao-texto');
        
        estrelas.forEach((estrela, index) => {
            estrela.innerHTML = index < nota ? '★' : '☆';
        });
        
        const mensagens = [
            '😞 Muito ruim...',
            '😐 Poderia ser melhor',
            '👍 Bom',
            '😊 Muito bom!',
            '🤩 Excelente! Obrigado!'
        ];
        
        texto.textContent = mensagens[nota - 1];
        localStorage.setItem('ultimaAvaliacao', JSON.stringify({ nota, data: new Date() }));
    }
};

window.profile = Profile;