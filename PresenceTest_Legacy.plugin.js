/**
 * @name PresenceTestLegacy
 * @author KingGamingYT
 * @description react sucks
 * @version 0.0.1
 */ 

const { Data, Webpack, React, Patcher, Utils, DOM, UI } = BdApi;
const ActivityStore = Webpack.getStore("PresenceStore");
const ApplicationStore = Webpack.getStore("ApplicationStore");
const { useStateFromStores } = Webpack.getMangled(m => m.Store, {
        useStateFromStores: Webpack.Filters.byStrings("useStateFromStores")
        }, { raw: true });
const p = Webpack.getMangled("FULL_SIZE", {test: x=>x.toString?.().includes('==')})
const intl = Webpack.getModule(x=>x.NW && x.NW.formatToMarkdownString)
const ActivityTimer = Webpack.getByStrings("UserProfileActivityBadges", {searchExports: true})
const SpotifyTimer = Webpack.getByStrings('TVs.colors.INTERACTIVE_NORMAL', 'preventDefault')
const ActivityCard = BdApi.Webpack.getByStrings("UserProfileActivityCardWrapper", {searchExports: true});

const styles = Object.assign({});

const statusCSS = webpackify(
    `
    .activityTitle, .headerText {
        font-family: var(--font-display);
        font-size: 14px;
        line-height: 1.2857142857142858;
        font-weight: 600;
        color: var(--header-primary);
        position: relative;
        z-index: 10;
    }
    .activityDetails, .stateDetails {
        color: var(--header-primary);
        font-size: 14px;
    }
    .headerText {
        text-transform: uppercase;
        font-weight: 800;
        font-size: 12px;
    }
    .activityContainer {
        background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), linear-gradient(var(--blurple), var(--blurple));
    }
    .presenceContainer {
        background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), linear-gradient(var(--blurple), var(--blurple));
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
    }
    .body {
        display: flex;
        flex-direction: column;
    }
    .content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: row;
        gap: 12px;
    }
    .details {
        gap: 4px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        align-self: center;
        width: 100%;
    }
    .imagePosition {
        position: relative;
        overflow: visible;
        display: flex;
        height: max-content;
        align-items: center;
    }
    .imageContainer {
        display: flex;
        border-radius: var(--radius-xs) !important;
    }
    .smallImageContainer {
        position: absolute;
        bottom: -4px;
        right: -4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
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
 
module.exports = class PresenceTest {
    constructor(meta) {
        this.meta = meta;
    }
    start() {     
        
            DOM.addStyle('statusCSS', statusCSS);
            Patcher.after("test", p, "test", (that, [props], res) => {
                const activities = useStateFromStores([ ActivityStore ], () => ActivityStore.getActivities(props.user.id));
                const headers = {
                    0: intl.NW.formatToPlainString(intl.t['iKo3yM']), // playing
                    1: intl.NW.formatToPlainString(intl.t['4CQq9f'], { name: '' }), // streaming
                    2: intl.NW.formatToPlainString(intl.t['NF5xoq'], { name: '' }), // listening
                    3: intl.NW.formatToPlainString(intl.t['pW3Ip6'], { name: '' }), // watching
                    5: intl.NW.formatToPlainString(intl.t['QQ2wVF'], { name: '' }) // competing
                };
                
                const header = activities.map(activity => headers[activity.type]).find(Boolean);

                function Activity({activity}) {
                    return React.createElement("div", {
                        className: "presenceContainer",
                        style: {paddingLeft: '24px', display: "flex", flexDirection: "column"},
                        children: [
                            React.createElement("div", {
                                className: "header",
                                children: React.createElement("div", {
                                    className: "headerText",
                                    children: header
                                })
                            }),
                            React.createElement("div", {
                                className: "body",
                                children:
                                    React.createElement("div", { 
                                        className: "content",
                                        children: [
                                            React.createElement("div", {
                                                className: "imagePosition",
                                                children: [
                                                    React.createElement("div", {
                                                    className: "imageContainer",
                                                    children: 
                                                        React.createElement("div", {
                                                            className: "contentImage",
                                                            children: [
                                                                activity.assets && activity.assets.large_image && !(activity.assets.large_image.includes('external') || activity.assets.large_image.includes('spotify') || activity.assets.large_image.includes('twitch') || activity.platform && activity.platform.includes('xbox')) && React.createElement("img", {
                                                                    src: "https://cdn.discordapp.com/app-assets/" + activity.application_id + "/" + activity.assets.large_image + ".png",
                                                                    style: {maxWidth: "80px", minHeight: "80px", objectFit: "cover", borderRadius: "var(--radius-xs)"}
                                                                }),
                                                                activity.assets && activity.assets.large_image && activity.assets.large_image.includes('external') /*|| activity.platform && activity.platform.includes('ps5') */ && React.createElement("img", {
                                                                    src: "https://media.discordapp.net/" + (activity.assets.large_image || activity.assets.small_image).split(":", 2)[1],
                                                                    style: {maxWidth: "80px", minHeight: "80px", objectFit: "cover", borderRadius: "var(--radius-xs)"},
                                                                }),
                                                                activity.assets && activity.assets.large_image && activity.assets.large_image.includes('spotify') && React.createElement("img", {
                                                                    src: "https://i.scdn.co/image/" + activity.assets.large_image.split(":", 2)[1],
                                                                    style: {maxWidth: "80px", minHeight: "80px", objectFit: "cover", borderRadius: "var(--radius-xs)"},
                                                                }),
                                                                activity.assets && activity.assets.large_image && activity.assets.large_image.includes('twitch') && React.createElement("img", {
                                                                    src: "https://static-cdn.jtvnw.net/previews-ttv/live_user_" + activity.assets.large_image.split(":", 2)[1] + "-160x160.jpg",
                                                                    style: {maxWidth: "unset", aspectRatio: "16 / 9", height: "90px", borderRadius: "8px"},
                                                                }),
                                                                !activity.assets && activity.application_id && !activity.platform && React.createElement("img", {
                                                                    src: "https://cdn.discordapp.com/app-icons/" + activity.application_id + "/" + ApplicationStore.getApplication(activity.application_id).icon + ".webp",
                                                                    style: {maxWidth: "80px", minHeight: "80px", objectFit: "cover", borderRadius: "var(--radius-xs)"}
                                                                }),
                                                                activity.assets && !activity.application_id && !activity.platform && !activity.sync_id && !activity.url && React.createElement("img", {
                                                                    src: "https://cdn.discordapp.com/app-icons/" + activity.application_id + "/" + ApplicationStore.getApplication(activity.application_id).icon + ".webp",
                                                                    style: {maxWidth: "80px", minHeight: "80px", objectFit: "cover", borderRadius: "var(--radius-xs)"}
                                                                }),
                                                                activity.assets && !activity.assets.large_image && !activity.platform && !activity.sync_id && React.createElement("img", {
                                                                    src: "https://cdn.discordapp.com/app-icons/" + activity.application_id + "/" + ApplicationStore.getApplication(activity.application_id).icon + ".webp",
                                                                    style: {maxWidth: "80px", minHeight: "80px", objectFit: "cover", borderRadius: "var(--radius-xs)"}
                                                                }),
                                                                activity.platform && activity.platform.includes('xbox') && React.createElement("img", {
                                                                    src: "https://discord.com/assets/fc0b586dbf05772e.png",
                                                                    style: {maxWidth: "80px", minHeight: "80px", objectFit: "cover", borderRadius: "var(--radius-xs)"}
                                                                }),
                                                                activity.application_id == null && !(activity.assets) && React.createElement("svg", {
                                                                    style: {maxWidth: "70px", width: "100%", height: "100%", borderRadius: "var(--radius-xs)", aspectRatio: "1 / 1"},
                                                                    viewBox: "0 0 24 24",
                                                                    children: 
                                                                            React.createElement("path", { 
                                                                                d: "M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm6.81 7c-.54 0-1 .26-1.23.61A1 1 0 0 1 8.92 8.5 3.49 3.49 0 0 1 11.82 7c1.81 0 3.43 1.38 3.43 3.25 0 1.45-.98 2.61-2.27 3.06a1 1 0 0 1-1.96.37l-.19-1a1 1 0 0 1 .98-1.18c.87 0 1.44-.63 1.44-1.25S12.68 9 11.81 9ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7-10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM5.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
                                                                                fill: "var(--white",
                                                                                fillRule: "evenodd",
                                                                                clipRule: "evenodd",
                                                                            })
                                                                        }),
                                                                    ]
                                                                })
                                                            }),
                                                        React.createElement("div", {
                                                            className: "smallImageContainer",
                                                            children: [
                                                                activity.assets && activity.assets.small_image && !(activity.assets.small_image.includes('external') || activity.assets.small_image.includes('spotify')) && React.createElement("img", {
                                                                    src: "https://cdn.discordapp.com/app-assets/" + activity.application_id + "/" + activity.assets.small_image + ".png",
                                                                    style: {maxWidth: "24px", minHeight: "24px", objectFit: "cover", borderRadius: "var(--radius-round)"}
                                                                }),
                                                                activity.assets && activity.assets.small_image && activity.assets.small_image.includes('external') && React.createElement("img", {
                                                                    src: "https://media.discordapp.net/" + activity.assets.small_image.split(":", 2)[1],
                                                                    style: {maxWidth: "24px", minHeight: "24px", objectFit: "cover", borderRadius: "var(--radius-round)"}

                                                                }),
                                                            ]
                                                        })
                                                ]
                                            }),
                                            React.createElement("div", {
                                                className: "details",
                                                children: [
                                                    React.createElement("div", { className: "activityTitle" }, activity.name),
                                                    React.createElement("div", { className: "activityDetails" }, activity.details),
                                                    React.createElement("div", { className: "stateDetails" }, activity.state),
                                                    activity.timestamps != null && React.createElement(ActivityTimer, {activity: activity}),
                                                    !activity.timestamps && React.createElement("div", { className: "timestamp" }, Date(activity.created_at))
                                                ]
                                            }),
                                        ]
                                    })
                            })    
                        ]
                    })
                }
                if (!props.profileType?.includes("FULL_SIZE")) return;
                console.log(activities);
                return [
                    res,
                    !activities.length == 0 && React.createElement("div", {
                        className: "activityContainer",
                        style: {},
                        children:
                            activities.map((activity) => activity?.type != 4 && React.createElement(Activity, {activity}))
                    })
                ]
            });
    }

    stop() {
        Patcher.unpatchAll("test");
    }
}