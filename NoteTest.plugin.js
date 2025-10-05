/**
 * @name NoteTest
 * @author KingGamingYT
 * @description Make viewing and editing notes easy again!
 * @version 0.0.1
 */

const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, ContextMenu } = BdApi;
const { createElement, Suspense } = React;

const UserProfilePopoutBody = Webpack.getByStrings(".pronouns", "UserProfilePopoutBody", "relationshipType", { defaultExport: false });
const BotProfilePopoutBody = Webpack.getByStrings("BotUserProfilePopout", "displayProfile",".hidePersonalInformation", { defaultExport: false});
const entireBotPopout = Webpack.getByStrings("BotUserProfilePopout", "onCloseProfile", "location", { defaultExport: false });
const GuildMemberStore = Webpack.getStore('GuildMemberStore');
const RoleRenderer = Webpack.getByStrings('guildMember', 'roles', 'canManageRoles');
const intl = Webpack.getModule(x=>x.t && x.t.formatToMarkdownString);
const UserNote = BdApi.React.lazy(() => {
    const modalModule = BdApi.Webpack.getMangled("onCloseRequest:null==", {
        openModalLazy: BdApi.Webpack.Filters.byRegex(/^async function/)
    });

    const { promise, resolve } = Promise.withResolvers();

    const openUserModal = [...Webpack.getByKeys("_dispatch")._subscriptions.USER_PROFILE_MODAL_OPEN].find(Webpack.Filters.byStrings("UserProfileModalManager"))

    const undo = Patcher.instead("NoteFetch", modalModule, "openModalLazy", (that, args, original) => {
        if (!String(args[1]?.modalKey).startsWith("USER_PROFILE_MODAL_KEY:"))  return original.apply(that, args);

        args[0]().then(() => {
            resolve({
                default: Webpack.getByStrings('hidePersonalInformation', 'onUpdate', 'placeholder')
            });
        });
    
        undo();
    });

    openUserModal({
        userId: Webpack.getStore('UserStore').getCurrentUser().id
    });

    return promise;
});

const styles = Object.assign({}
);

const noteCSS = webpackify(
    `
    .noteSectionHeaderText, .memberSinceHeaderText, .roleSectionHeaderText {
        font-size: 12px;
        color: var(--header-secondary);
        font-weight: 800;
        font-family: var(--font-display);
        margin-bottom: 5px;
    }
    .noteContainer {
        textarea {
            background: unset !important;
            border: unset !important;
            max-height: 88px;
            margin-left: -4px;
        }
        textarea:focus {
            background: var(--background-tertiary) !important;
        }
    }
    .nicknameIcons__63ed3 {
        display: none !important;
    }
    .footer__5be3e {
        margin-top: unset !important;
    }
    .memberSince, .memberSinceServer {
        color: var(--text-normal);
        font-size: 14px;
    }
    .divider {
        background-color: var(--interactive-normal);
        border-radius: 50%;
        height: 4px;
        width: 4px;
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

module.exports = class NoteTest {
    start() {
        DOM.addStyle('noteCSS', noteCSS);
        const showSince = 0;
        const showRoles = 0;    
        Patcher.after('test', UserProfilePopoutBody, "Z", (that, [props], res) => {
            const serverMember = GuildMemberStore.getMember(props?.guild?.id, props.user.id)
            const serverDate = new Date(GuildMemberStore.getMember(serverMember)?.joinedAt);
            console.log(props)
            if (showSince == 1) {
                res.props.children.splice(7, 0, 
                    createElement('div', {className: "memberSinceContainer" },
                        createElement('div', {className: "memberSinceHeaderText"}, intl.intl.formatToPlainString(intl.t['a6XYDw'])),
                        createElement('div', {className: "memberSinceWrapper", style: { display: "flex", gap: "8px", alignItems: "center" }},
                            createElement('div', {className: "memberSince"}, props.user.createdAt.toString().substring(3, 7) + " " + props.user.createdAt.getDate() + ", " + props.user.createdAt.toString().substring(11, 15)),
                            props.guild?.joinedAt && [
                                createElement('div', {className: "divider" }),
                                createElement('div', {className: "memberSinceServer"}, serverDate.toString().substring(3, 7) + " " + serverDate.getDate() + ", " + serverDate.toString().substring(11, 15))
                            ]
                        )
                    )
                )
            }
            if (props?.guild && showRoles == 1) {
                if (serverMember?.roles?.length === 0) {
                    res.props.children.push(
                        createElement('div', {className: "roleSectionContainer"},
                            createElement('div', {className: "roleSectionHeaderText"}, intl.intl.formatToPlainString(intl.t['gm1Ven']) + " " + intl.intl.formatToPlainString(intl.t['LPJmLy']))
                        )
                    )
                }
                else {
                    res.props.children.push(
                        createElement('div', {className: "roleSectionContainer"},
                            serverMember?.roles?.length !== 1 ? createElement('div', {className: "roleSectionHeaderText"}, intl.intl.formatToPlainString(intl.t['LPJmLy']))
                            : createElement('div', {className: "roleSectionHeaderText"}, intl.intl.formatToPlainString(intl.t['IqVT2N'])),
                            createElement(RoleRenderer, { user: props.user, currentUser: props.currentUser, guild: props.guild})
                        )
                    )
                }
            }
            res.props.children.push(
                createElement('div', {className: "noteContainer"},
                    createElement('div', {className: "noteSectionHeaderText"}, intl.intl.formatToPlainString(intl.t['PbMNh4'])),
                    createElement(Suspense, {
                        children: createElement(UserNote, { userId: props.user.id })
                    })
                )
            )
        })
        Patcher.after('test', BotProfilePopoutBody, "Z", (that, [props], res) => {
            const serverDate = new Date(GuildMemberStore.getMember(props?.guild?.id, props.user.id)?.joinedAt);
            console.log(res)
            if (showSince == 1) {
                res.props.children.splice(7, 0, 
                    createElement('div', {className: "memberSinceContainer" },
                        createElement('div', {className: "memberSinceHeaderText"}, intl.intl.formatToPlainString(intl.t['a6XYDw'])),
                        createElement('div', {className: "memberSinceWrapper", style: { display: "flex", gap: "8px", alignItems: "center" }},
                            createElement('div', {className: "memberSince"}, props.user.createdAt.toString().substring(3, 7) + " " + props.user.createdAt.getDate() + ", " + props.user.createdAt.toString().substring(11, 15)),
                            props.guild?.joinedAt && [
                                createElement('div', {className: "divider" }),
                                createElement('div', {className: "memberSinceServer"}, serverDate.toString().substring(3, 7) + " " + serverDate.getDate() + ", " + serverDate.toString().substring(11, 15))
                            ]
                        )
                    )
                )
            }
            res.props.children.push(
                createElement('div', {className: "noteContainer"},
                    createElement('div', {className: "noteSectionHeaderText"}, intl.intl.formatToPlainString(intl.t['PbMNh4'])),
                    createElement(Suspense, {
                        children: createElement(UserNote, { userId: props.user.id })
                    })
                )
            )
        })
    }
    stop() {
        Patcher.unpatchAll('test');
        Patcher.unpatchAll('NoteFetch')
        DOM.removeStyle('noteCSS'); 
    }
}