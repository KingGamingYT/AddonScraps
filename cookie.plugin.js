/**
 * @name cookie
 * @author me
 * @version 9.1.1
 */

const cookie = BdApi.Webpack.getByKeys('R6', 'TH');
const exportz = BdApi.Webpack.getModules(BdApi.Webpack.Filters.bySource("){return!1}function","){return!0}function")).find(a => typeof a !== "function" && !a.createRoot);

const undos = Object.keys(exports).map(key => BdApi.Patcher.after("T", exports, key, () => false));

function forceUpdateApp() {
    const appMount = document.getElementById("app-mount");

    const reactContainerKey = Object.keys(appMount).find(m => m.startsWith("__reactContainer$"));

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

module.exports = class cookie {
    constructor(meta) {}

    start() {
        BdApi.Patcher.after('sdf', exportz, (that, [props], res) => {
            for (let i = 0; i < exportz.length; i++) { 
                props[i] = false; 
            }
            forceUpdateApp() 
        });
    }

    stop() {
        BdApi.Patcher.unpatchAll('sdf');
        forceUpdateApp()
    }
}