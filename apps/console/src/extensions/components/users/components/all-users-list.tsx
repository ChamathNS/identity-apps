/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { hasRequiredScopes, isFeatureEnabled, resolveUserstore } from "@wso2is/core/helpers";
import {
    AlertLevels,
    LoadableComponentInterface,
    SBACInterface,
    TestableComponentInterface
} from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { CommonUtils } from "@wso2is/core/utils";
import {
    ConfirmationModal,
    DataTable,
    EmptyPlaceholder,
    LinkButton,
    ListLayout,
    TableActionsInterface,
    TableColumnInterface,
    UserAvatar,
    useConfirmationModalAlert
} from "@wso2is/react-components";
import React, { ReactElement, ReactNode, SyntheticEvent, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { DropdownProps, Header, Icon, ListItemProps, PaginationProps, Popup, SemanticICONS } from "semantic-ui-react";
import {
    AdvancedSearchWithBasicFilters,
    AppState,
    FeatureConfigInterface,
    UIConstants,
    getEmptyPlaceholderIllustrations, history
} from "../../../../features/core";
import { RealmConfigInterface } from "../../../../features/server-configurations";
import { deleteUser } from "../../../../features/users/api";
import { UserManagementConstants } from "../../../../features/users/constants";
import { UserBasicInterface, UserListInterface } from "../../../../features/users/models";
import { CONSUMER_USERSTORE } from "../../../../features/userstores";
import { deleteGuestUser } from "../api";
import { UsersConstants } from "../constants";
import { UserAccountSources, UserAccountTypes } from "../pages";

/**
 * Prop types for the all users list component.
 */
interface AllUsersListProps extends SBACInterface<FeatureConfigInterface>, LoadableComponentInterface,
    TestableComponentInterface {

    /**
     * Default list item limit.
     */
    defaultListItemLimit?: number;
    /**
     * Callback to inform the new set of visible columns.
     * @param {TableColumnInterface[]} columns - New columns.
     */
    onColumnSelectionChange?: (columns: TableColumnInterface[]) => void;
    /**
     * Callback to be fired when the empty list placeholder action is clicked.
     */
    onEmptyListPlaceholderActionClick?: () => void;
    /**
     * On list item select callback.
     */
    onListItemClick?: (event: SyntheticEvent, data: ListItemProps) => void;
    /**
     * Admin user details content.
     */
    realmConfigs: RealmConfigInterface;
    /**
     * Enable selection styles.
     */
    selection?: boolean;
    /**
     * Show list item actions.
     */
    showListItemActions?: boolean;
    /**
     * Meta column list for the user list.
     */
    userMetaListContent?: Map<string, string>;
    /**
     * Users list.
     */
    allUsersList: UserListInterface;
    /**
     * Callback to fetch all users list.
     *
     * @param limit
     * @param offset
     * @param filter
     * @param attribute
     * @param domain
     */
    getAllUsersList: (limit: number, offset: number, filter: string, attribute: string, domain: string) => void;
    /**
     * List of readOnly user stores.
     */
    readOnlyUserStores?: string[];
    /**
     * Flag for request loading status.
     */
    isUserListRequestLoading: boolean;
    isNextPage?: boolean;
    /**
     * Toggle help panel visibility
     */
    showHelpPanel?: boolean;
    setShowHelpPanel: (value: boolean) => void;
}

/**
 * All users list component.
 *
 * @return {ReactElement}
 */
export const AllUsersList: React.FunctionComponent<AllUsersListProps> = (props: AllUsersListProps): ReactElement => {
    const {
        defaultListItemLimit,
        isLoading,
        readOnlyUserStores,
        featureConfig,
        onColumnSelectionChange,
        onListItemClick,
        realmConfigs,
        selection,
        showListItemActions,
        getAllUsersList,
        isUserListRequestLoading,
        allUsersList,
        isNextPage,
        showHelpPanel,
        setShowHelpPanel,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [ showDeleteConfirmationModal, setShowDeleteConfirmationModal ] = useState<boolean>(false);
    const [ deletingUser, setDeletingUser ] = useState<UserBasicInterface>(undefined);
    const [ alert, setAlert, alertComponent ] = useConfirmationModalAlert();

    const [ searchQuery, setSearchQuery ] = useState<string>("");

    const [ listOffset, setListOffset ] = useState<number>(0);
    const [ listItemLimit, setListItemLimit ] = useState<number>(UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT);
    const [ usersList, setUsersList ] = useState<UserListInterface>({});
    const [ userStoreOptions, setUserStoresList ] = useState([]);
    const [ triggerClearQuery, setTriggerClearQuery ] = useState<boolean>(false);
    const [ userStoreError, setUserStoreError ] = useState(false);
    const [ emailVerificationEnabled, setEmailVerificationEnabled ] = useState<boolean>(undefined);

    const [ isNextPageAvailable, setIsNextPageAvailable ] = useState<boolean>(false);
    const [ isPreviousPageAvailable, setIsPreviousPageAvailable ] = useState<boolean>(false);
    const [ tenantAdmin, setTenantAdmin ] = useState<string>("");

    /**
     * Set tenant admin.
     */
    useEffect(() => {
        if (!realmConfigs) {
            return;
        }

        setTenantAdmin(realmConfigs?.adminUser);
    }, [ realmConfigs ]);

    /**
     * Set users list.
     */
    useEffect(() => {
        if (!allUsersList) {
            return;
        }

        setUsersList(allUsersList);
    }, [ allUsersList ]);

    useEffect(() => {
        if (searchQuery == undefined || searchQuery == "") {
            getAllUsersList(listItemLimit, listOffset, null, null, null);
        } else  {
            getAllUsersList(listItemLimit, listOffset, searchQuery, null, null);

        }
    }, [ listOffset, listItemLimit ]);

    const allowedScopes: string = useSelector((state: AppState) => state?.auth?.scope);

    const handleUserEdit = (user: UserBasicInterface) => {
        if (resolveUserstore(user.userName) === CONSUMER_USERSTORE) {
            history.push(UsersConstants.getPaths().get("CONSUMER_USER_EDIT_PATH").replace(":id", user.id));
        } else {
            history.push(UsersConstants.getPaths().get("GUEST_USER_EDIT_PATH").replace(":id", user.id));
        }

    };

    const handleGuestUserDelete = (userId: string): void => {
        deleteGuestUser(userId)
            .then(() => {
                dispatch(addAlert({
                    description: t(
                        "console:manage.features.invite.notifications.deleteInvite.success.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "console:manage.features.users.notifications.deleteUser.success.message"
                    )
                }));
                setDeletingUser(undefined);
                getAllUsersList(listItemLimit, listOffset, null, null, null);
            }).catch((error) => {
            if (error.response && error.response.data && error.response.data.description) {
                dispatch(addAlert({
                    description: error.response.data.description,
                    level: AlertLevels.ERROR,
                    message: t("console:manage.features.users.notifications.deleteUser.error.message")
                }));
                return;
            }
            dispatch(addAlert({
                description: t("console:manage.features.users.notifications.deleteUser.genericError.description"),
                level: AlertLevels.ERROR,
                message: t("console:manage.features.users.notifications.deleteUser.genericError" +
                    ".message")
            }));
        });
    };

    const handleConsumerUserDelete = (userId: string): void => {
        deleteUser(userId)
            .then(() => {
                dispatch(addAlert({
                    description: t(
                        "console:manage.features.users.notifications.deleteUser.success.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "console:manage.features.users.notifications.deleteUser.success.message"
                    )
                }));
                setDeletingUser(undefined);
                getAllUsersList(listItemLimit, listOffset, null, null, null);
            }).catch((error) => {
            if (error.response && error.response.data && error.response.data.description) {
                dispatch(addAlert({
                    description: error.response.data.description,
                    level: AlertLevels.ERROR,
                    message: t("console:manage.features.users.notifications.deleteUser.error.message")
                }));
                return;
            }
            dispatch(addAlert({
                description: t("console:manage.features.users.notifications.deleteUser.genericError.description"),
                level: AlertLevels.ERROR,
                message: t("console:manage.features.users.notifications.deleteUser.genericError" +
                    ".message")
            }));
        });
    };

    /**
     * Resolves data table columns.
     *
     * @return {TableColumnInterface[]}
     */
    const resolveTableColumns = (): TableColumnInterface[] => {
        const defaultColumns: TableColumnInterface[] = [
            {
                allowToggleVisibility: false,
                dataIndex: "name",
                id: "name",
                key: "name",
                render: (user: UserBasicInterface): ReactNode => {
                    const resolvedUserName = (user.name && user.name.givenName !== undefined)
                        ? user.name.givenName + " " + (user.name.familyName ? user.name.familyName : "")
                        : user.userName.split("/")?.length > 1
                            ? user.userName.split("/")[ 1 ]
                            : user.userName.split("/")[ 0 ];

                    const resolvedDescription = user.emails
                        ? user.emails[ 0 ]?.toString()
                        : user.userName;

                    const isNameAvailable = user.name?.familyName === undefined && user.name?.givenName === undefined;

                    return (
                        <Header
                            image
                            as="h6"
                            className="header-with-icon"
                            data-testid={ `${ testId }-item-heading` }
                        >
                            <UserAvatar
                                data-testid="all-users-list-item-image"
                                name={
                                    user.userName.split("/")?.length > 1
                                        ? user.userName.split("/")[ 1 ]
                                        : user.userName.split("/")[ 0 ]
                                }
                                size="mini"
                                image={ user.profileUrl }
                                spaced="right"
                            />
                            <Header.Content>
                                <div className={ isNameAvailable ? "mt-2" : "" }>{ resolvedUserName }</div>
                                {
                                    (!isNameAvailable) &&
                                    <Header.Subheader
                                        data-testid={ `${ testId }-item-sub-heading` }
                                    >
                                        { resolvedDescription }
                                    </Header.Subheader>
                                }
                            </Header.Content>
                        </Header>
                    );
                },
                title: "User"
            },
            {
                allowToggleVisibility: false,
                dataIndex: "type",
                id: "type",
                key: "type",
                title: (
                    <> 
                        Account Type 
                        <Popup
                            trigger={
                                <div onClick={ () => {setShowHelpPanel(!showHelpPanel)} } className="inline" >
                                    <Icon disabled name='info circle' className="link pointing pl-1" />
                                </div>
                            }
                            content="User's relation to this organization."
                            position="top center"
                            size="mini"
                            hideOnScroll
                            inverted
                        />
                    </>
                ),
                render: (user: UserBasicInterface): ReactNode => {
                    if (user.userName === tenantAdmin) {
                        return "Owner";
                    }
                    if (resolveUserstore(user.userName) === CONSUMER_USERSTORE) {
                        return UserAccountTypes.CONSUMER;
                    } else {
                        return UserAccountTypes.GUEST;
                    }
                }
            },
            {
                allowToggleVisibility: false,
                dataIndex: "source",
                id: "source",
                key: "source",
                title: (
                    <> 
                        Source
                        <Popup
                            trigger={
                                <div onClick={ () => {setShowHelpPanel(!showHelpPanel)} } className="inline" >
                                    <Icon disabled name='info circle' className="link pointing pl-1" />
                                </div>
                            }
                            content="Where user is managed."
                            position="top center"
                            size="mini"
                            hideOnScroll
                            inverted
                        /> 
                    </>
                ),
                render: (user: UserBasicInterface): ReactNode => {
                    if (resolveUserstore(user.userName) === CONSUMER_USERSTORE) {
                        return UserAccountSources.LOCAL_CONSUMER;
                    } else {
                        return UserAccountSources.ASGARDEO;
                    }
                }
            },
            {
                allowToggleVisibility: false,
                dataIndex: "action",
                id: "actions",
                key: "actions",
                textAlign: "right",
                title: ""
            }
        ];

        return defaultColumns;
        // if (!showMetaContent || !userMetaListContent) {
        //     return defaultColumns;
        // }
        //
        // const dynamicColumns: TableColumnInterface[]= [];
        //
        // for (const [key, value] of userMetaListContent.entries()) {
        //     if (key === "name" || key === "emails" || key === "profileUrl" || value === "") {
        //         continue;
        //     }
        //
        //     let dynamicColumn: TableColumnInterface = {
        //         allowToggleVisibility: true,
        //         dataIndex: value,
        //         id: key,
        //         key: key,
        //         title: value
        //     };
        //
        //     if (key === "meta.lastModified") {
        //         dynamicColumn = {
        //             ...dynamicColumn,
        //             render: (user: UserBasicInterface): ReactNode =>
        //                 CommonUtils.humanizeDateDifference(user?.meta?.lastModified),
        //             title: "Modified Time"
        //         };
        //     }
        //
        //     dynamicColumns.push(dynamicColumn);
        // }
        //
        // dynamicColumns.unshift(defaultColumns[0]);
        // dynamicColumns.push(defaultColumns[1);
        //
        // return dynamicColumns;
    };

    /**
     * Handles the `onSearchQueryClear` callback action.
     */
    const handleSearchQueryClear = (): void => {
        setTriggerClearQuery(!triggerClearQuery);
        setSearchQuery("");
        getAllUsersList(listItemLimit, 1, null, null, null);
    };

    /**
     * Handles the `onFilter` callback action from the
     * users search component.
     *
     * @param {string} query - Search query.
     */
    const handleUserFilter = (query: string): void => {
        if (query === "userName sw ") {
            getAllUsersList(listItemLimit, 1, null, null, null);
            return;
        }

        setSearchQuery(query);
        getAllUsersList(listItemLimit, 1, query, null, null);
    };

    const handlePaginationChange = (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
        setListOffset((data.activePage as number - 1) * listItemLimit + 1);
    };

    const handleItemsPerPageDropdownChange = (event: React.MouseEvent<HTMLAnchorElement>, data: DropdownProps) => {
        setListItemLimit(data.value as number);
    };

    /**
     * Resolves data table actions.
     *
     * @return {TableActionsInterface[]}
     */
    const resolveTableActions = (): TableActionsInterface[] => {
        if (!showListItemActions) {
            return;
        }

        const actions: TableActionsInterface[] = [
            {
                hidden: (): boolean => !isFeatureEnabled(featureConfig?.users,
                    UserManagementConstants.FEATURE_DICTIONARY.get("USER_READ")),
                icon: (user: UserBasicInterface): SemanticICONS => {
                    const userStore = user?.userName?.split("/").length > 1
                        ? user?.userName?.split("/")[0]
                        : UsersConstants.ASGARDEO_USERSTORE;

                    return !hasRequiredScopes(featureConfig?.users, featureConfig?.users?.scopes?.update, allowedScopes)
                    || !isFeatureEnabled(featureConfig?.users,
                        UserManagementConstants.FEATURE_DICTIONARY.get("USER_UPDATE"))
                    || readOnlyUserStores?.includes(userStore.toString())
                        ? "eye"
                        : "pencil alternate";
                },
                "data-testid": "all-users-list-item-edit-button",
                onClick: (e: SyntheticEvent, user: UserBasicInterface): void =>
                    handleUserEdit(user),
                popupText: (user: UserBasicInterface): string => {
                    const userStore = user?.userName?.split("/").length > 1
                        ? user?.userName?.split("/")[0]
                        : UsersConstants.ASGARDEO_USERSTORE;

                    return !hasRequiredScopes(featureConfig?.users, featureConfig?.users?.scopes?.update, allowedScopes)
                    || !isFeatureEnabled(featureConfig?.users,
                        UserManagementConstants.FEATURE_DICTIONARY.get("USER_UPDATE"))
                    || readOnlyUserStores?.includes(userStore.toString())
                        ? t("common:view")
                        : t("common:edit");
                },
                renderer: "semantic-icon"
            }
        ];

        actions.push({
            hidden: (user: UserBasicInterface): boolean => {
                const userStore = user?.userName?.split("/").length > 1
                    ? user?.userName?.split("/")[0]
                    : UsersConstants.ASGARDEO_USERSTORE;

                return !isFeatureEnabled(featureConfig?.users,
                    UserManagementConstants.FEATURE_DICTIONARY.get("USER_DELETE"))
                    || !hasRequiredScopes(featureConfig?.users, featureConfig?.users?.scopes?.delete, allowedScopes)
                    || readOnlyUserStores?.includes(userStore.toString())
                    || user.userName === realmConfigs?.adminUser;
            },
            icon: (): SemanticICONS => "trash alternate",
            "data-testid": "all-users-list-item-delete-button",
            onClick: (e: SyntheticEvent, user: UserBasicInterface): void => {
                setShowDeleteConfirmationModal(true);
                setDeletingUser(user);
            },
            popupText: (): string => t("console:manage.features.users.usersList.list.iconPopups.delete"),
            renderer: "semantic-icon"
        });

        return actions;
    };

    /**
     * Shows list placeholders.
     *
     * @return {React.ReactElement}
     */
    const showPlaceholders = (): ReactElement => {
        // When the search returns empty.
        if (searchQuery) {
            return (
                <EmptyPlaceholder
                    action={ (
                        <LinkButton onClick={ handleSearchQueryClear }>
                            { t("console:manage.features.users.usersList.search.emptyResultPlaceholder.clearButton") }
                        </LinkButton>
                    ) }
                    image={ getEmptyPlaceholderIllustrations().emptySearch }
                    imageSize="tiny"
                    title={ t("console:manage.features.users.usersList.search.emptyResultPlaceholder.title") }
                    subtitle={ [
                        t("console:manage.features.users.usersList.search.emptyResultPlaceholder.subTitle.0",
                            { query: searchQuery }),
                        t("console:manage.features.users.usersList.search.emptyResultPlaceholder.subTitle.1")
                    ] }
                />
            );
        }

        if (usersList.totalResults === 0) {
            return (
                <EmptyPlaceholder
                    data-testid={ `${ testId }-empty-placeholder` }
                    image={ getEmptyPlaceholderIllustrations().newList }
                    imageSize="tiny"
                    title={ t("console:manage.features.users.usersList.list.emptyResultPlaceholder.title") }
                    subtitle={ [
                        t("console:manage.features.users.usersList.list.emptyResultPlaceholder.subTitle.0"),
                        t("console:manage.features.users.usersList.list.emptyResultPlaceholder.subTitle.1"),
                        t("console:manage.features.users.usersList.list.emptyResultPlaceholder.subTitle.2")
                    ] }
                />
            );
        }

        return null;
    };

    return (
        <ListLayout
            // TODO add sorting functionality.
            advancedSearch={
                <AdvancedSearchWithBasicFilters
                    onFilter={ handleUserFilter }
                    filterAttributeOptions={ [
                        {
                            key: 0,
                            text: t("console:manage.features.users.advancedSearch.form.dropdown." +
                                "filterAttributeOptions.username"),
                            value: "userName"
                        },
                        {
                            key: 1,
                            text: t("console:manage.features.users.advancedSearch.form.dropdown." +
                                "filterAttributeOptions.email"),
                            value: "emails"
                        },
                        {
                            key: 2,
                            text: "First Name",
                            value: "name.givenName"
                        },
                        {
                            key: 3,
                            text: "Last Name",
                            value: "name.familyName"
                        }
                    ] }
                    filterAttributePlaceholder={
                        t("console:manage.features.users.advancedSearch.form.inputs.filterAttribute" +
                            ".placeholder")
                    }
                    filterConditionsPlaceholder={
                        t("console:manage.features.users.advancedSearch.form.inputs.filterCondition" +
                            ".placeholder")
                    }
                    filterValuePlaceholder={
                        t("console:manage.features.users.advancedSearch.form.inputs.filterValue" +
                            ".placeholder")
                    }
                    placeholder={ t("console:manage.features.users.advancedSearch.placeholder") }
                    defaultSearchAttribute="userName"
                    defaultSearchOperator="co"
                />
            }
            currentListSize={ usersList.itemsPerPage }
            listItemLimit={ listItemLimit }
            onItemsPerPageDropdownChange={ handleItemsPerPageDropdownChange }
            data-testid="user-mgt-user-list-layout"
            onPageChange={ handlePaginationChange }
            showPagination={ true }
            showTopActionPanel={ isUserListRequestLoading
            || !(!searchQuery
                && !userStoreError
                && userStoreOptions.length < 3
                && usersList?.totalResults <= 0) }
            totalPages={ Math.ceil(usersList.totalResults / listItemLimit) }
            totalListSize={ usersList.totalResults }
            paginationOptions={ {
                disableNextButton: !isNextPage
            } }
        >
            <DataTable<UserBasicInterface>
                className="users-table"
                isLoading={ isLoading }
                loadingStateOptions={ {
                    count: defaultListItemLimit ?? UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT,
                    imageType: "circular"
                } }
                actions={ resolveTableActions() }
                columns={ resolveTableColumns() }
                data={ usersList.Resources }
                onColumnSelectionChange={ onColumnSelectionChange }
                onRowClick={ (e: SyntheticEvent, user: UserBasicInterface): void => {
                    handleUserEdit(user);
                    onListItemClick && onListItemClick(e, user);
                } }
                placeholders={ showPlaceholders() }
                selectable={ selection }
                showHeader={ true }
                transparent={ !isLoading && (showPlaceholders() !== null) }
                data-testid={ testId }
            />
            {
                deletingUser && (
                    <ConfirmationModal
                        data-testid={ `${ testId }-confirmation-modal` }
                        onClose={ (): void => setShowDeleteConfirmationModal(false) }
                        type="warning"
                        open={ showDeleteConfirmationModal }
                        assertion={
                            deletingUser.userName?.split("/")?.length > 1
                            &&  deletingUser.userName?.split("/")[0] === CONSUMER_USERSTORE
                                ? deletingUser.userName?.split("/")[1]
                                : deletingUser.userName
                        }
                        assertionHint={
                            (
                                <p>
                                    <Trans
                                        i18nKey={ "console:manage.features.user.deleteUser.confirmationModal." +
                                        "assertionHint" }
                                        tOptions={ {
                                            userName: deletingUser.userName?.split("/")?.length > 1
                                                &&  deletingUser.userName?.split("/")[0] === CONSUMER_USERSTORE
                                                    ? deletingUser.userName?.split("/")[1]
                                                    : deletingUser.userName
                                        } }
                                    >
                                        Please type <strong>
                                        {
                                            deletingUser.userName?.split("/")?.length > 1
                                            &&  deletingUser.userName?.split("/")[0] === CONSUMER_USERSTORE
                                                ? deletingUser.userName?.split("/")[1]
                                                : deletingUser.userName
                                        }
                                    </strong> to confirm.
                                    </Trans>
                                </p>
                            )
                        }
                        assertionType="input"
                        primaryAction="Confirm"
                        secondaryAction="Cancel"
                        onSecondaryActionClick={ (): void =>{
                            setShowDeleteConfirmationModal(false);
                            setAlert(null);
                        } }
                        onPrimaryActionClick={ (): void => {
                            if (deletingUser.userName?.split("/")[0] === CONSUMER_USERSTORE) {
                                handleConsumerUserDelete(deletingUser.id);
                            } else {
                                handleGuestUserDelete(deletingUser.id);
                            }
                        } }
                        closeOnDimmerClick={ false }
                    >
                        <ConfirmationModal.Header data-testid={ `${ testId }-confirmation-modal-header` }>
                            { t("console:manage.features.user.deleteUser.confirmationModal.header") }
                        </ConfirmationModal.Header>
                        <ConfirmationModal.Message
                            data-testid={ `${ testId }-confirmation-modal-message` }
                            attached
                            warning
                        >
                            { t("console:manage.features.user.deleteUser.confirmationModal.message") }
                        </ConfirmationModal.Message>
                        <ConfirmationModal.Content data-testid={ `${ testId }-confirmation-modal-content` }>
                            <div className="modal-alert-wrapper"> { alert && alertComponent }</div>
                            { t("console:manage.features.user.deleteUser.confirmationModal.content") }
                        </ConfirmationModal.Content>
                    </ConfirmationModal>
                )
            }
        </ListLayout>
    );
};

/**
 * Default props for the component.
 */
AllUsersList.defaultProps = {
    selection: true,
    showListItemActions: true
};