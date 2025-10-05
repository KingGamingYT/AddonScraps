/**
 * @name ThePopoutToEndAllPopouts
 * @author KingGamingYT
 * @description lol
 * @version 0.0.1
 */ 

const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, Components } = BdApi;
const { createElement, useMemo, useRef, Suspense } = React;

const entireProfileModal = Webpack.getBySource('forceShowPremium', 'pendingThemeColors');
const ActivityStore = Webpack.getStore("PresenceStore");
const { useStateFromStores } = Webpack.getMangled(m => m.Store, {
        useStateFromStores: Webpack.Filters.byStrings("useStateFromStores")
        }, { raw: true });
const avatarFetch = Webpack.getByStrings('displayProfile', 'onOpenProfile', 'animateOnHover', 'previewStatus');
const EmojiRenderer = Webpack.getByStrings('translateSurrogatesToInlineEmoji');
const RoleListRenderer = Webpack.getByStrings('guildMember', 'roles', 'canManageRoles');
const RoleRenderer = Webpack.getByStrings('role', 'canRemove', 'unsafe_rawColors.PRIMARY_300');
const RolePermissionCheck = Webpack.getByStrings('.ADMINISTRATOR', '.MANAGE_MESSAGES');
const RoleAddButton = Webpack.getByStrings('guildMember','numRoles','highestRole','onAddRole');
const RoleUpdater = Webpack.getModule(x=>x.updateMemberRoles);
const RelationshipStore = Webpack.getStore('RelationshipStore');
const MarkdownRenderer = Webpack.getByStrings('userBio', 'className', '.parseBioReact');
const ModalAccessUtils = Webpack.getModule(x=>x.openUserProfileModal);
const GuildUtils = Webpack.getModule(x=>x.unassignGuildRoleConnection);
const GuildMemberStore = Webpack.getStore('GuildMemberStore');
const GuildRoleStore = Webpack.getStore('GuildRoleStore')
const BotTagRenderer = Webpack.getBySource(".botTag", "invertColor");
const intl = Webpack.getModule(x=>x.t && x.t.formatToMarkdownString);
const UserNote = React.lazy(() => {
    const modalModule = Webpack.getMangled("onCloseRequest:null==", {
        openModalLazy: Webpack.Filters.byRegex(/^async function/)
    });

    const { promise, resolve } = Promise.withResolvers();

    const openUserModal = Webpack.getByKeys("openUserProfileModal")

    const undo = Patcher.instead("NoteFetch", modalModule, "openModalLazy", (that, args, original) => {
        if (!String(args[1]?.modalKey).startsWith("USER_PROFILE_MODAL_KEY:"))  return original.apply(that, args);

        args[0]().then(() => {
            resolve({
                default: Webpack.getByStrings('hidePersonalInformation', 'onUpdate', 'placeholder')
            });
        });
    
        undo();
    });

    openUserModal.openUserProfileModal({
        userId: Webpack.getStore('UserStore').getCurrentUser().id
    });

    return promise;
});


function activityCheck({activities}) {
    let pass = {
        playing: 0,
        xbox: 0,
        playstation: 0,
        streaming: 0,
        listening: 0,
        spotify: 0,
        watching: 0,
        competing: 0,
        custom: 0
    };
    for (let i = 0; i < activities.length; i++) {
        if (activities[i].type == 4) {
            pass.custom = 1;
        }
        if (activities[i].type == 0) {
            pass.playing = 1;
        }
        if (activities[i]?.platform?.includes("xbox")) {
            pass.xbox = 1;
        }
        if (activities[i]?.platform?.includes("playstation") || activities[i]?.platform?.includes("ps5")) {
            pass.playstation = 1;
        }
        if (activities[i].type == 1) {
            pass.streaming = 1;
        }
        if (activities[i].type == 2) {
            pass.listening = 1;
        }
        if (activities[i].name.includes("Spotify")) {
            pass.spotify = 1;
        }
        if (activities[i].type == 3) {
            pass.watching = 1;
        }
        if (activities[i].type == 5) {
            pass.competing = 1;
        }
    }
    return pass;
}

function BioBuilder({displayProfile}) {
    /*if (displayProfile?._guildMemberProfile?.bio && Data.load('serverBio')) {
        return [
            <div className="userInfoSectionHeader">{intl.intl.formatToPlainString(intl.t['NepzEx'])}</div>,
            <MarkdownComponent userBio={displayProfile.bio} />
        ]
    }
    */
    if (displayProfile._userProfile.bio) {
        return [
            createElement('div', { className: "bodyTitle size12" }, intl.intl.formatToPlainString(intl.t['NepzEx'])),
            createElement(MarkdownRenderer, { userBio: displayProfile._userProfile.bio, className: "userBio", setLineClamp: false, textColor: "text-default" })
        ]
    }
    return;
}

function RoleBuilder({user, data, role, serverMember, MemberRoles}) {
    return [ 
        createElement(RoleRenderer, { 
            className: "role", 
            role: role, 
            guildId: data.guild.id, 
            canRemove: RolePermissionCheck({guildId: data.guild.id, channelId: data.channelId}).canRemove, 
            onRemove: () => { return RoleUpdater.updateMemberRoles(data.guild.id, user.id, serverMember.roles.filter(mRole => mRole !== role.id), [], [role.id]) }
        }),
    ]
}

function RolesInnerBuilder({user, data, serverMember, selfServerMember, MemberRoles}) {
    const refDOM = useRef(null);
    return createElement('div', {className: "rolesList", "aria-orientation": "vertical"},
        [
            MemberRoles.map(role => createElement(RoleBuilder, {user: user, data: data, role: role, serverMember: serverMember, MemberRoles: MemberRoles})),
            createElement('div',{style: {width: "24px", height: "24px"}},
                createElement(RoleAddButton, {
                    guild: data.guild, 
                    guildMember: serverMember, 
                    numRoles: MemberRoles.length, 
                    highestRole: GuildRoleStore.getRole(data.guild.id, selfServerMember.highestRoleId), 
                    onAddRole: (w) => { let b = serverMember.roles; b.push(w); return RoleUpdater.updateMemberRoles(data.guild.id, user.id, b, [w], [])}, 
                    buttonRef: refDOM
                })
            )
        ]
    )
}

function NoRolesInnerBuilder({user, data, serverMember, selfServerMember, MemberRoles}) {
    const refDOM = useRef(null);
    return (
        createElement('div', {className: "rolesList", "aria-orientation": "vertical"},
            createElement(RoleAddButton, {
                guild: data.guild, 
                guildMember: serverMember, 
                numRoles: MemberRoles.length, 
                highestRole: GuildRoleStore.getRole(data.guild.id, selfServerMember.highestRoleId), 
                onAddRole: (w) => { let b = serverMember.roles; b.push(w); return RoleUpdater.updateMemberRoles(data.guild.id, user.id, b, [w], [])}, 
                buttonRef: refDOM
            })
        )
    )
}

function RolesBuilder({user, data}) {
    if (!data?.guild?.id) {
        return;
    }
    const serverMember = GuildMemberStore.getMember(data.guild?.id, user.id);
    const selfServerMember = GuildMemberStore.getMember(data.guild?.id, data.currentUser.id);
    const MemberRoles = serverMember.roles?.map(role => GuildRoleStore.getRole(data.guild.id, role))
    if (serverMember?.roles?.length === 0) {
        return [
            createElement('div', {className: "bodyTitle size12", style:{ marginBottom: RolePermissionCheck({guildId: data.guild.id, channelId: data.channelId}).canRemove ? null : "28px" }}, intl.intl.formatToPlainString(intl.t['nZfHsb'])),
            createElement(NoRolesInnerBuilder, {user: user, data: data, serverMember: serverMember, selfServerMember: selfServerMember, MemberRoles: MemberRoles})
        ]
    }
    //console.log(GuildRoleStore.getRole(data.guild.id, serverMember.highestRoleId))
    return [
        createElement('div', {className: "bodyTitle size12"}, 
            serverMember?.roles?.length !== 1 ? intl.intl.formatToPlainString(intl.t['LPJmLy'])
            : intl.intl.formatToPlainString(intl.t['IqVT2N'])
        ),
        createElement(RolesInnerBuilder, {user: user, data: data, serverMember: serverMember, selfServerMember: selfServerMember, MemberRoles: MemberRoles})
    ]
}

function HeaderInnerBuilder({data, user, currentUser, displayProfile, tagName, displayName, nickName, activities}) {
    const _activities = activities.filter(activity => activity && activity.type === 4);
    const _emoji = activities.filter(activity => activity.emoji);
    const serverMember = GuildMemberStore.getMember(displayProfile.guildId, user.id);

    return createElement('div', {className:"headerTop", style:{ flex: "1 1 auto"}},
        [
            createElement(avatarFetch, {className: "avatarWrapper", user: user, guildId: displayProfile.guildId, onOpenProfile: () => { ModalAccessUtils.openUserProfileModal({ userId: user.id}); data.onClose()}}),
            createElement('div', {className: "headerText"},
                serverMember?.nick ? [
                    createElement('div', {className: "headerNameWrapper"},
                        createElement('div', {className: "headerName"}, serverMember.nick)
                    ),
                    createElement('div', {className: "flexHorizontal", style:{flex: "1 1 auto"}},
                        createElement('div', {className: "headerTag headerTagWithNickname size14"},
                            [
                                displayProfile._userProfile?.legacyUsername && createElement('div', {className: "nameDisplay"}, displayName || tagName),
                                displayProfile._userProfile?.legacyUsername ? createElement('div', {className: "discriminator"}, displayProfile._userProfile?.legacyUsername?.substring(displayProfile._userProfile?.legacyUsername?.indexOf("#")))
                                : user.bot ? createElement('div', {className: "discriminator"}, "#" + user.discriminator)
                                : createElement('div', {className: "userName"},  "@" + tagName),
                                user.bot && createElement(BotTagRenderer.Z, {type: user.system ? BotTagRenderer.Z.Types.OFFICIAL : BotTagRenderer.Z.Types.BOT, verified: user.publicFlags & (1<<16), className: "botTag"})
                            ]
                        )
                    )
                ]
                :
                createElement('div', {className: "flexHorizontal", style:{flex: "1 1 auto"}},
                    createElement('div', {className: "headerTag headerTagNoNickname size16"},
                        [
                            createElement('div', {className: "nameDisplay"}, nickName || displayName || tagName),
                            displayProfile._userProfile?.legacyUsername ? createElement('div', {className: "discriminator"}, displayProfile._userProfile?.legacyUsername?.substring(displayProfile._userProfile?.legacyUsername?.indexOf("#")))
                            : user.bot ? createElement('div', {className: "discriminator"}, "#" + user.discriminator)
                            : createElement('div', {className: "userName"},  "@" + tagName),
                            user.bot && createElement(BotTagRenderer.Z, {type: user.system ? BotTagRenderer.Z.Types.OFFICIAL : BotTagRenderer.Z.Types.BOT, verified: user.publicFlags & (1<<16), className: "botTag"})
                        ]
                    )
                )
            ),
            _activities.length !== 0 && createElement('div', {className: "customStatus"},
                [
                    _emoji.map(emoji => React.createElement(EmojiRenderer, { emoji: _activities[0].emoji })),
                    React.createElement("div", { className: "customStatusText" }, _activities[0].state)
                ]
            )
        ]
    )
}
function headerBuilder({data, user, currentUser, displayProfile}) {
    const tagName = user.username;
    const displayName = user.globalName;
    const nickName = RelationshipStore.getNickname(user.id)
    const activities = useStateFromStores([ ActivityStore ], () => ActivityStore.getActivities(user.id));
    const check = activityCheck({activities});
    const voice = undefined;

    if (activities.length !== 0 && (check.playing === 1 || check.listening === 1 || check.watching === 1) && (check.spotify === 0 && check.streaming === 0 && check.xbox === 0) || voice !== undefined) {
        return createElement('div', {className: "headerPlaying header", style: { backgroundColor: "var(--bg-brand)" }, 
            children: [
                displayProfile.banner && createElement('img', { 
                    className: "userBanner", 
                    src: displayProfile.getBannerURL({canAnimate: true}), 
                    style: { 
                        width: "250px", 
                        height: "100px" 
                    }, 
                    alt: ""
                }),
                createElement(HeaderInnerBuilder, {data, user, currentUser, displayProfile, tagName, displayName, nickName, activities}),
        ]})
    }
    else if (activities.length !== 0 && check.spotify === 1 || voice !== undefined) {
        return createElement('div', {className: "headerSpotify header", style: { background: "#1db954" }, 
            children: [
                displayProfile.banner && createElement('img', { 
                    className: "userBanner", 
                    src: displayProfile.getBannerURL({canAnimate: true}), 
                    style: { 
                        width: "250px", 
                        height: "100px" 
                    }, 
                    alt: ""
                }),
                createElement(HeaderInnerBuilder, {data, user, currentUser, displayProfile, tagName, displayName, nickName, activities}),
        ]})
    }
    else if (activities.length !== 0 && check.streaming === 1 || voice !== undefined) {
        return createElement('div', {className: "headerStreaming header", style: { background: "#593695" }, 
            children: [
                displayProfile.banner && createElement('img', { 
                    className: "userBanner", 
                    src: displayProfile.getBannerURL({canAnimate: true}), 
                    style: { 
                        width: "250px", 
                        height: "100px" 
                    }, 
                    alt: ""
                }),
                createElement(HeaderInnerBuilder, {data, user, currentUser, displayProfile, tagName, displayName, nickName, activities}),
        ]})
    }
    else if (activities.length !== 0 && check.xbox === 1 || voice !== undefined) {
        return createElement('div', {className: "headerXbox header", style: { background: "#107c10" }, 
            children: [
                displayProfile.banner && createElement('img', { 
                    className: "userBanner", 
                    src: displayProfile.getBannerURL({canAnimate: true}), 
                    style: { 
                        width: "250px", 
                        height: "100px" 
                    }, 
                    alt: ""
                }),
                createElement(HeaderInnerBuilder, {data, user, currentUser, displayProfile, tagName, displayName, nickName, activities}),
        ]})
    }
    return createElement('div', {className: "headerNormal header", style: { backgroundColor: "var(--background-tertiary)" }, 
        children: [
            displayProfile.banner && createElement('img', { 
                className: "userBanner", 
                src: displayProfile.getBannerURL({canAnimate: true}), 
                style: { 
                    width: "250px", 
                    height: "100px" 
                }, 
                alt: ""
            }),
            createElement(HeaderInnerBuilder, {data, user, currentUser, displayProfile, tagName, displayName, nickName, activities})
    ]})
}

function bodyBuilder({props, data, user, displayProfile}) {
    return createElement('div', {className: "body scrollerBase", style:{ overflow: "hidden scroll", paddingRight: "0px" }},
        createElement('div', {className: "bodyInnerWrapper"},
            [   
                createElement(BioBuilder, {displayProfile: displayProfile}),
                displayProfile._guildMemberProfile && createElement(RolesBuilder, {user, data}),
                createElement('div', {className: "bodyTitle size12"}, intl.intl.formatToPlainString(intl.t['PbMNh4'])),
                createElement('div', {className: "note"}, 
                    createElement(Suspense, {
                        children: createElement(UserNote, { userId: user.id })
                    })
                )
            ]
        )
    )
}

const styles = Object.assign(
    {
        roleName: Webpack.getByKeys('role', 'roleName', 'roleNameOverflow').roleName
    },
    Webpack.getByKeys('outer', 'overlay'),
    Webpack.getByKeys('root', 'pill', 'expandButton')
);

const popoutCSS = webpackify(
    `

        .outer.user-profile-popout {
            width: fit-content;
        }

        .outer.user-profile-popout.custom-user-profile-theme {
            /* background: linear-gradient(var(--profile-gradient-primary-color) / 50%, var(--profile-gradient-secondary-color) / 50%); */
            --profile-gradient-start: color-mix(in oklab, var(--profile-gradient-primary-color) 100%, var(--profile-gradient-primary-color)) !important;
            --profile-gradient-end: color-mix(in oklab, var(--profile-gradient-secondary-color) 100%, var(--profile-gradient-secondary-color)) !important;
            --custom-user-profile-theme-color-blend: linear-gradient(color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-start)), color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-end)));
        }

        :where(.theme-dark) .outer:not(.disable-profile-themes) .userPopout {
            background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), var(--custom-theme-base-color, var(--background-secondary, var(--background-base-lower))) !important;
        }
        :where(.theme-light) .outer:not(.disable-profile-themes) .userPopout {
            background: var(--custom-theme-base-color, var(--background-secondary, var(--background-base-lower))) !important;
        }

        .custom-theme-background .theme-dark, .theme-dark.custom-theme-background {
            --custom-theme-base-color: var(--custom-user-profile-theme-color-blend, var(--theme-base-color-dark)) !important;
        }
        .custom-theme-background .theme-light, .theme-light.custom-theme-background {
            --custom-theme-base-color: var(--custom-user-profile-theme-color-blend, var(--theme-base-color-light)) !important;
        }

        .userPopout {
            box-shadow: 0 2px 10px 0 rgba(0,0,0,.2), 0 0 0 1px rgba(32,34,37,.6);
            width: 250px;
            border-radius: 5px;
            overflow: hidden;
            max-height: calc(100vh - 20px);
            display: flex;
            flex-direction: column;
        }

        .size14 {
            font-size: 14px;
        }

        .size16 {
            font-size: 16px;
        }

        .size12 {
            font-size: 12px;
        }

        .userPopout .userBanner {
            margin-bottom: -50px;
            mask-image: linear-gradient(to bottom, #fff, rgb(255 255 255 / 0%));
            pointer-events: none;
        }
        
        .headerTop {
            padding: 16px;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
            display: flex;
        }

        .avatarWrapper {
            margin-bottom: 12px;
            position: relative;
            left: unset !important;
            top: unset !important;
            width: initial;
        }

        .userPopout .headerText {
            flex-direction: column;
            text-align: center;
            align-items: center;
            display: flex;
            user-select: text;
            overflow: hidden;
        }

        .userPopout .headerNameWrapper {
            align-items: center;
        }

        .userPopout .headerName {
            margin-bottom: 2px;
            color: var(--white);
            font-size: 16px;
            font-weight: 600;
            white-space: normal;
        }
        
        .flexHorizontal {
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            display: flex;
        }

        .userPopout :is(.headerName, .headerTag) {
            font-weight: 600;
        }

        .userPopout .headerTag {
            color: var(--header-secondary);
            font-weight: 500;
            line-height: 18px;
            flex-wrap: wrap;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
        
        .userPopout .nameDisplay {
            color: var(--white);
            flex: 0 1 auto;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .userPopout .headerTagWithNickname .nameDisplay {
            color: var(--header-secondary);
        }

        .userPopout .headerTagNoNickname .nameDisplay {
            font-weight: 600;
        }
        .userPopout .discriminator {
        
        }

        .userPopout .userName {
            margin-left: 5px;
        }

        .userPopout :is(.discriminator, .userName) {
            font-weight: 500;
        }
        
        .userPopout :is(.nameTag, .discriminator, .userName) {
            display: block;
        }

        .customStatus {
            color: var(--header-secondary);
            margin-top: 12px;
            text-align: center;
            width: 100%;
            overflow-wrap: break-word;
            font-size: 14px;
            line-height: 18px;
            font-weight: 500;
        }

        .customStatus .emoji {
            width: 20px;
            height: 20px;
        }

        .customStatus .emoji:not(:last-child) {
            margin-right: 8px;
        }

        .customStatus .emoji+.customStatusText {
            display: inline;
        }
        
        .customStatus:has(.customStatusText:empty) .emoji {
            height: 48px;
            width: 48px;
        }

        .userPopout .customStatusText {
            user-select: text;
            text-align: baseline;
        }

        .userPopout .botTag {
            flex: 0 0 auto;
            margin-left: 1ch;
        }

        .userPopout .scrollerBase {
            position: relative;
            box-sizing: border-box;
            min-height: 0;
            flex: 1 1 auto;
            &::-webkit-scrollbar {
            background: none;
            border-radius: 8px;
            width: 8px;
            }
            &::-webkit-scrollbar-thumb {
                background-clip: padding-box;
                border: solid 2px #0000;
                border-radius: 8px;
            }
            &:hover::-webkit-scrollbar-thumb {
                background-color: var(--bg-overlay-6, var(--background-tertiary, var(--background-base-lowest)));
            }
        }

        .userPopout .body {
            flex: 0 1 auto;
            min-height: 0;
            padding: 16px 8px 16px 16px;
        }

        .userPopout :is(.body, .footer) {
            background-color: var(--background-secondary, var(--background-base-lower));
            color: hsla(0,0%,100%,.8);
        }

        .userPopout .bodyInnerWrapper {
            padding-right: 8px;
        }

        .userPopout .bodyTitle {
            font-weight: 700;
            color: var(--header-secondary);
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .userPopout .bodyInnerWrapper .userBio {
            margin-bottom: 16px;
            -webkit-line-clamp: 190 !important;
            max-height: 92px;
            overflow-x: hidden;
            overflow-y: auto;
                &::-webkit-scrollbar {
                background: none;
                border-radius: 8px;
                width: 8px;
            }
            &::-webkit-scrollbar-thumb {
                background-clip: padding-box;
                border: solid 2px #0000;
                border-radius: 8px;
            }
            &:hover::-webkit-scrollbar-thumb {
                background-color: var(--bg-overlay-6, var(--background-tertiary, var(--background-base-lowest)));
            }
        }
        
        .userPopout .bodyInnerWrapper .rolesList {
            position: relative;
            flex-wrap: wrap;
            display: flex;
            margin-top: 12px;
            margin-bottom: 16px;
            .role {
                height: 22px;
                border: 1px solid;
                border-radius: 11px;
                .roleName {
                    margin-top: 2px;
                }
            }
        }

        .userPopout .body:has(.bodyInnerWrapper:empty) {
            display: none;
        }

        .userPopout .bodyInnerWrapper .note {
            margin-left: -4px;
            margin-right: -4px;
        }

        .userPopout .bodyInnerWrapper .note textarea {
            background-color: transparent;
            border: none;
            box-sizing: border-box;
            color: var(--text-default);
            font-size: 12px;
            line-height: 14px;
            max-height: 88px;
            padding: 4px;
            resize: none;
            width: 100%;
        }

        .userPopout .bodyInnerWrapper .note textarea:focus {
            background-color: var(--background-tertiary, var(--background-base-lowest)) !important;
        }
        
        :is(.headerPlaying, .headerSpotify, .headerStreaming, .headerXbox) {
            .avatarWrapper rect {
                fill: #fff;
            }
            .nameDisplay, .discriminator, .userName, .customStatus {
                color: var(--white) !important;
            }
            .botTag {
                background: var(--white);
                > span {
                    color: var(--bg-brand);
                }
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

function Starter({props, res}) {
    const options = {
        walkable: [
            'props',
            'children'
        ],
        ignore: []
    };
    //console.log(props)
    const data = Utils.findInTree(props, (tree) => Object.hasOwn(tree, 'isHovering'), options)
    const user = props.user
    const currentUser = data?.currentUser;
    const displayProfile = props.displayProfile;

    const detailsCheck = useMemo(() => { 
        if (!props.displayProfile._userProfile) return null;
        return props.displayProfile._userProfile; }, [ props.displayProfile._userProfile ]
    );
    if (!detailsCheck) return;
    console.log(Utils.findInTree(props, (tree) => Object.hasOwn(tree, 'isHovering'), options))
    return [
        createElement('div', {className: "userPopout"}, 
            [
                createElement(headerBuilder, {data, user, currentUser, displayProfile}),
                createElement(bodyBuilder, {data, user, displayProfile})
            ]
        )
    ]
}

module.exports = class ThePopoutToEndAllPopouts {
    constructor(meta){}
    start() {
        DOM.addStyle('popoutCSS', popoutCSS);
        Patcher.after('ThePopoutToEndAllPopouts', entireProfileModal.Z, "render", (that, [props], res) => {
            if (!props.themeType?.includes("POPOUT")) return;
            if (!Utils.findInTree(props, x => x?.displayProfile, { walkable: ['props', 'children'] }) || Utils.findInTree(res, (tree) => tree?.action === "PRESS_SWITCH_ACCOUNTS", { walkable: ['props', 'children'] })) return;
            //console.log(props);
            res.props.children = createElement(Starter, {props, res})
        })
    }
    stop() {
        Patcher.unpatchAll("ThePopoutToEndAllPopouts");
        DOM.removeStyle('popoutCSS');
    }
}