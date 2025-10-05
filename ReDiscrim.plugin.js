/**
 * @name ReDiscrim
 * @author KingGamingYT
 * @description Restore the visibility of a user's legacy discriminator (if it is available).
 * @version 0.0.1
 */ 


const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, Components } = BdApi;
const { createElement, useState, useRef, useMemo } = React;

const profileModal = Webpack.getMangled("clickableUsername", {user: x=>x.toString?.().includes('==')});

module.exports = class ReDiscrim {
    constructor(meta){}
    start() {
        Patcher.after('ReDiscrim', profileModal, "user", (that, [props], res) => {
            console.log(props);
            res.props.children[0].props.children.splice(1, 0, createElement('div', 
                {
                    className: "userDiscriminator", 
                    style: { marginLeft: "-5px", fontSize: "20px", color: "var(--header-secondary)", fontWeight: "500" }}, 
                    props.tags.props.displayProfile._userProfile?.legacyUsername?.substring(props.tags.props.displayProfile._userProfile?.legacyUsername?.indexOf("#"))));
        })
    }
    stop() {
        Patcher.unpatchAll('ReDiscrim');
    }
}