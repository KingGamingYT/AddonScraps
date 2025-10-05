/**
 * @name LancerButton
 * @author KingGamingYT
 * @description lancersplat.ogg
 * @version 0.0.1
 */

const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, ContextMenu } = BdApi;
const { createElement, Suspense } = React;

let splat = new Audio('https://github.com/KingGamingYT/kinggamingyt.github.io/raw/refs/heads/main/Assets/lancersplat.mp3')
let lancer_spin = new Audio('https://deltarune.com/assets/audio/lancer-spin.mp3')
lancer_spin.loop = true;
const ChatButtons = Webpack.getModule((m) => m.type?.toString?.().includes('"sticker")'));
const Tooltip = Webpack.getModule(Webpack.Filters.byPrototypeKeys("renderTooltip"), { searchExports: true });
const TooltipBuilder = ({ note, position, children }) => {
    return (
        React.createElement(Tooltip, {
            text: note,
            position: position || "top",
        }, props => {
            children.props = {
                ...props,
                ...children.props
            };
            return children;
        })
    );
};

module.exports = class LancerButton{
    start() {
        Patcher.after('LancerButton', ChatButtons, "type", (that, [props], res) => {
            res.props.children.splice(0, 0, 
                createElement(TooltipBuilder, { note: "Lancer" },
                    createElement('div', { className: "lancerButton", style: { width: "24px", height: "24px" }, onClick: () => {splat.play(), lancer_spin.play(), BdApi.showToast('HO HO HO!!! YOU JUST GOT LANCERED!!!',{type:'success'});BdApi.showToast('HO HO HO!!! YOU JUST GOT LANCERED!!!',{type:'warning'});BdApi.showToast('HO HO HO!!! YOU JUST GOT LANCERED!!!',{type:'error'});BdApi.showToast('HO HO HO!!! YOU JUST GOT LANCERED!!!');BdApi.showConfirmationModal('HO HO HO!!! YOU JUST GOT LANCERED!!!','HO HO HO!!! YOU JUST GOT LANCERED!!!',{cancelText:'HO HO HO!!! YOU JUST GOT LANCERED!!!',confirmText:'HO HO HO!!! YOU JUST GOT LANCERED!!!'});const lancer='https://deltarune.com/assets/images/lancer-spin.png';const lancer2=document.querySelectorAll('[class^="userName" i], [class^="title_"], [class^="topic"], [class^="roleColor"], [class^="name_"], [class^="channelName"], [class^="overflow_"], [class^="markup_"], [class^="textContent"]');const lancer3=document.querySelectorAll('[style*="background-image"]');const lancer4=document.getElementsByTagName('img');for(const lancer_spin of lancer2){lancer_spin.innerText='HO HO HO!!! YOU JUST GOT LANCERED!!!'}for(const lancer_spin of lancer3){lancer_spin.style.backgroundImage=`url(${lancer})`}for(const lancer_spin of lancer4){lancer_spin.src=lancer} } },
                        createElement('img', { src: 'https://raw.githubusercontent.com/KingGamingYT/kinggamingyt.github.io/refs/heads/main/Assets/LancerHead3.png', style: { width: "24px", height: "24px" } })
                    )
                )
            )
        })
    }
    stop() {
        Patcher.unpatchAll('LancerButton')
        lancer_spin.stop();
    }
}