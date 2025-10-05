/**
 * @name modalTest
 * @author KingGamingYT
 * @description not lol
 * @version 0.0.1
 */ 

const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, Components } = BdApi;
const { createElement, useMemo, useEffect, useRef, Suspense } = React;

const modalData = Webpack.getBySource('forceShowPremium', 'pendingThemeColors');
const botModalRoot = Webpack.getModule((a, b) => b.id === 752342).Z;

function Starter({props, res}) {
    const options = {
        walkable: [
            'props',
            'children'
        ],
        ignore: []
    };
    const data = Utils.findInTree(props, (tree) => Object.hasOwn(tree, 'initialSection'), options)
    const user = data.user;
    const currentUser = data.currentUser;
    const displayProfile = data.displayProfile;
    const ref = useRef(null);

    const detailsCheck = useMemo(() => { 
        if (!data.displayProfile._userProfile) return null;
        return data.displayProfile._userProfile; }, [ data.displayProfile._userProfile ]
    );
    if (!detailsCheck) return;
    return [
        createElement('div', {className: "inner"}, 
            [
                createElement(botModalRoot, {user: user, currentUser: currentUser})
            ]
        )
    ]
}

module.exports = class modaltest {
    constructor(meta){}
    start() {
        Patcher.after('modalTest', modalData.Z, "render", (that, [props], res) => {
            if (!props.themeType?.includes("MODAL")) return;
            if (!Utils.findInTree(props, x => x?.displayProfile, { walkable: ['props', 'children'] })) return;
            if (!Utils.findInTree(props, (tree) => Object.hasOwn(tree, 'initialSection'), { walkable: ['props', 'children'] })) {
                return res.props.children;
            }
            res.props.children = createElement(Starter, {props, res})
        })
    }
    stop() {
        Patcher.unpatchAll("modalTest");
    }
}