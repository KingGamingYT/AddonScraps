/**
 * @name RestoreUserPanelButtons
 * @author KingGamingYT
 * @description gg ez 420 11pixels
 * @version 0.0.1
 */ 

const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, ContextMenu } = BdApi;
const { createElement } = React;

const userPanel = Webpack.getModule((a, b) => b.id === 374005);
const downloadButton = Utils.findInTree(ReactUtils.wrapInHooks(Webpack.getByStrings('app-download-button'))(), r => Object.hasOwn(r, 'onClick'), { walkable: ['props', 'children'] });
const changelog = Webpack.getByStrings(",{modalKey:", "arguments.length>0");
const intl = Webpack.getModule(x=>x.t && x.t.formatToMarkdownString);

function fu() {
    const appMount = document.getElementById("app-mount");
    const reactContainerKey = Object.keys(appMount).find((m) => m.startsWith("__reactContainer$"));
    let container = appMount[reactContainerKey];
    while (!container.stateNode?.isReactComponent) {
    container = container.child;
    }
    const { render } = container.stateNode;
    if (render.toString().includes("null")) return;
    container.stateNode.render = () => null;
    container.stateNode.forceUpdate(() => {
    container.stateNode.render = render;
    container.stateNode.forceUpdate();
    });
}

function PanelButtonBuilder() {
    return (
        createElement('div', { className: "buttonPanel_pixe11" }, [
            createElement('a', { className: "support_pixe11", href: "https://support.discord.com", target: "_blank" }, intl.intl.formatToPlainString(intl.t['Yl/Rio'])),
            createElement('div', { className: 'dot_pixe11' }),
            createElement('button', { className: "changelog_pixe11", onClick: () => { changelog() } }, intl.intl.formatToPlainString(intl.t['+Gnad3'])),
            createElement('div', { className: 'dot_pixe11' }),
            createElement('button', { className: "downloadApps_pixe11", onClick: () => { downloadButton.onClick() } }, intl.intl.formatToPlainString(intl.t['Z7jwrK']))
        ])
    )
}

const styles = Object.assign({});

const buttonPanelCSS = webpackify(
    `
        .buttonPanel_pixe11 {
            display: flex;
            padding: 8px 8px 4px 8px;
            align-items: center;
            border-top: 1px solid var(--border-faint);
            button, .support_pixe11 {
                color: var(--header-secondary);
                font-size: 12px;
                background: unset;
                margin-bottom: 2px;
                align-self: baseline;
            }
            a {
                font-weight: var(--font-weight-medium);
                margin-right: 5px; 
            }
            .dot_pixe11 {
                background-color: var(--header-secondary);
                border-radius: 50%;
                height: 4px;
                width: 4px;
                max-width: 4px;
            }
        }
    `
)

function webpackify(css) {
    for (const key in styles) {
        let regex = new RegExp(`\\.${key}([\\s,.):>])`, 'g');
        css = css.replace(regex, `.${styles[key]}$1`);
    }
    return css;
}

module.exports = class RestoreUserPanelButtons {
    start() {
        DOM.addStyle('buttonPanelCSS', buttonPanelCSS);
        function fu() {
            const appMount = document.getElementById("app-mount");
            const reactContainerKey = Object.keys(appMount).find((m) => m.startsWith("__reactContainer$"));
            let container = appMount[reactContainerKey];
            while (!container.stateNode?.isReactComponent) {
            container = container.child;
            }
            const { render } = container.stateNode;
            if (render.toString().includes("null")) return;
            container.stateNode.render = () => null;
            container.stateNode.forceUpdate(() => {
            container.stateNode.render = render;
            container.stateNode.forceUpdate();
            });
        }

        fu();

        Patcher.after('RestoreUserPanelButtons', userPanel.b, 'type', (that, props, res) => {
            res.props.children.props.children.push(createElement(PanelButtonBuilder))
        })
    }
    stop() {
        Patcher.unpatchAll('RestoreUserPanelButtons');
        fu();
    }
}