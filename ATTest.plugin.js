/**
 * @name ATTest
 * @author KingGamingYT
 * @description THE HALFWAY MARK HAS BEEN ATTAINED.
 * @version 0.0.1
 */ 


const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, Components } = BdApi;
const { createElement, useState, useRef, useMemo } = React;

const { app } = Webpack.getModule(m => m.app && m.layers);
const { container } = Webpack.getModule(m => m.container && m.panels);
const GameStore = Webpack.getStore("GameStore");
const RunningGameStore = Webpack.getStore("RunningGameStore");
const dmSidebar = Webpack.getBySource(".Z.CONTACTS_LIST");
const LinkButton = Webpack.getByStrings('route', 'iconClassName', {searchExports: true});
const ControllerIcon = createElement('svg', {style: {width: "20", height: "20"}, viewBox: "0 0 20 20", fill: "none"},
                createElement('path', {d: "M15.1604 13.735H46.836C50.7677 13.735 54.0322 16.7112 54.3162 20.555L55.981 43.0836C56.1692 45.6297 54.2157 47.8431 51.6182 48.0276C51.5047 48.0357 51.3912 48.0397 51.2775 48.0397C48.2957 48.0397 45.6945 46.0559 44.962 43.2228L43.6727 38.2383H18.3236L17.0344 43.2228C16.3018 46.0559 13.7006 48.0397 10.7189 48.0397C8.11433 48.0397 6.00293 45.9701 6.00293 43.4173C6.00293 43.3061 6.00705 43.1946 6.01525 43.0836L7.67998 20.555C7.964 16.7112 11.2285 13.735 15.1604 13.735ZM37.2482 25.9867C39.3192 25.9867 40.9982 24.3411 40.9982 22.3112C40.9982 20.2812 39.3192 18.6357 37.2482 18.6357C35.1772 18.6357 33.4982 20.2812 33.4982 22.3112C33.4982 24.3411 35.1772 25.9867 37.2482 25.9867ZM47.2482 33.3377C49.3192 33.3377 50.9982 31.692 50.9982 29.6622C50.9982 27.6323 49.3192 25.9867 47.2482 25.9867C45.1772 25.9867 43.4982 27.6323 43.4982 29.6622C43.4982 31.692 45.1772 33.3377 47.2482 33.3377ZM15.9982 23.5363H10.9982V28.437H15.9982V33.3377H20.9982V28.437H25.9982V23.5363H20.9982V18.6357H15.9982V23.5363Z", fill: "#B9BBBE", transform: "scale(0.35)"})
            )
const HeaderBar = Webpack.getByStrings('innerClassName', 'showToolbar', 'childrenBottom');
const useLocation = Object.values(Webpack.getBySource(".location", "withRouter")).find(m => m.length === 0 && String(m).includes(".location"));
const Route = Webpack.getByStrings('["impressionName","impressionProperties","disableTrack"]');
const NavigationUtils = Webpack.getMangled("transitionTo - Transitioning to", {
    transitionTo: Webpack.Filters.byStrings("\"transitionTo - Transitioning to \""),
    replace: Webpack.Filters.byStrings("\"Replacing route with \""),
    goBack: Webpack.Filters.byStrings(".goBack()"),
    goForward: Webpack.Filters.byStrings(".goForward()"),
    transitionToGuild: Webpack.Filters.byStrings("\"transitionToGuild - Transitioning to \"")
});

function useSelectedState() {
    return useLocation().pathname.startsWith("/activity-center");
}

function NavigatorButton() {
    
    return createElement(LinkButton, 
        { 
            selected: useSelectedState(), 
            route: "/activity-center", 
            text: "Activity", 
            icon: () => { return ControllerIcon}
        }
    )
}

function QuickLauncherBuilder(props) {
    const gameList = RunningGameStore.getGamesSeen();
    const _gameList = gameList.filter(game => GameStore.getGameByName(game.name));
    const __gameList = _gameList.slice(2);

    return createElement('div', {...props})
}

const styles = Object.assign({}
);

const activityPanelCSS = webpackify(
    `
        .activityCenter_267ac {
            background: var(--background-gradient-chat, var(--background-base-low));
            border-top: 1px solid var(--app-border-frame);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            width: 100%;
        }

        .title_267ac {
            align-items: center;
            display: flex;
            justify-content: flex-start;
            overflow: hidden;
            white-space: nowrap;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.25;
            color: var(--header-primary);
        }

        .titleWrapper_267ac {
            flex: 0 0 auto;
            margin: 0 8px 0 0;
            min-width: auto;
        }

        .iconWrapper_267ac {
            align-items: center;
            display: flex;
            flex: 0 0 auto;
            height: var(--space-32);
            justify-content: center;
            margin: 0;
            position: relative;
            width: var(--space-32);
        }

        .headerBar_267ac {
            height: 47px;
            min-height: 47px;
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

module.exports = class ATTest {
    start() {
        const View = Utils.findInTree(
            ReactUtils.getInternalInstance(document.querySelector(`.${app}`)),
            node => node.memoizedProps?.children?.length === 3,
            { walkable: [ "return" ] }
        );
        const inst = ReactUtils.getOwnerInstance(document.querySelector(`.${container}`));
        const Route = Webpack.getByStrings('["impressionName","impressionProperties","disableTrack"]');

        DOM.addStyle('activityPanelCSS', activityPanelCSS);
        Patcher.after("ATTest", View.stateNode, "render", (that, [props], res) => {
            const view = Utils.findInTree(that.props, (node) => node?.props?.path?.length > 5, { walkable: [ "children", "props" ] });
            console.log(Utils.findInTree(that.props, (node) => node?.props?.path?.length > 5, { walkable: [ "children", "props" ] }));
            if (!view) return;
            view.props.path.push("/activity-center");
            view.props.path = Array.from(new Set(view.props.path));
        });
        View.stateNode.forceUpdate();

        Patcher.after("ATTest", dmSidebar, "Z", (that, [props], res) => {
            const panel = Utils.findInTree(res, m => m?.homeLink, { walkable: [ "props", "children" ] });
            const selected = useSelectedState();

            if (selected) {
                for (const child of panel.children) {
                    const link = Utils.findInTree(child, m => m && typeof m === "object" && "selected" in m, { walkable: [ "props", "children" ] });
                    if (link) {
                        link.selected = false;
                    }
                }
            }

            const index = panel.children.findIndex(m => m?.key === "activityCenter_button");
            if (index !== -1) return;

            panel.children.unshift(
                createElement(NavigatorButton, {key: "activityCenter_button"})
            );
        });

        function NewType(props) {
            const ret = NewType._(props);

            const { children } = Utils.findInTree(ret, (node) => node && node.children?.length > 5, { walkable: [ "children", "props" ] });

            children.push(
                createElement(Route, {
                    disableTrack: true,
                    path: "/activity-center",
                    render: () => createElement("div", {
                        className: "activityCenter_267ac",
                        style: { color: "red" },
                        children: [
                            createElement(HeaderBar, {
                                className: "headerBar_267ac",
                                "aria-label": "Activity",
                                children: [
                                    createElement('div', { className: "iconWrapper_267ac" }, 
                                        ControllerIcon
                                    ),
                                    createElement('div', { className: "titleWrapper_267ac" },
                                        createElement('div', {className: "title_267ac"}, "Activity")
                                    )
                                ]
                            }),
                            createElement(QuickLauncherBuilder, { className: "quickLauncher_267ac", style: { position: "relative" } }),
                            createElement('div', {style: { color: "red" }}, "test")
                        ]
                    }),
                    exact: true
                })
            )
            
            return ret;
        }

        Patcher.after("ATTest", inst, "render", (that, args, res) => {
            NewType._ ??= res.props.children.type;

            res.props.children.type = NewType;
        });

        inst.forceUpdate();

        Patcher.after("ATTest", Webpack.getByPrototypeKeys("handleHistoryChange", "ensureChannelMatchesGuild").prototype, "render", (that, args, res) => {
            const Route = Utils.findInTree(res, (node) => node && node.path?.length > 5, { walkable: [ "children", "props" ] });

            Route.path = [
                ...Route.path.filter(m => m !== "/activity-center"),
                "/activity-center"
            ]
        });

        ReactUtils.getOwnerInstance(document.querySelector("div[class^=app_] > div[class^=app_]"), {
            filter: m => typeof m.ensureChannelMatchesGuild === "function"
        }).forceUpdate()
    }
    stop() {
        const inst = ReactUtils.getOwnerInstance(document.querySelector(`.${container}`));
        Patcher.unpatchAll('ATTest');
        inst.forceUpdate();
    }
}
