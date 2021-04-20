/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { hasRequiredScopes, isFeatureEnabled, resolveUserstore } from "@wso2is/core/helpers";
import { LoadableComponentInterface, SBACInterface, TestableComponentInterface } from "@wso2is/core/models";
import { CommonUtils } from "@wso2is/core/utils";
import {
    AnimatedAvatar,
    AppAvatar,
    ConfirmationModal,
    DataTable,
    EmptyPlaceholder,
    LinkButton,
    PrimaryButton,
    TableActionsInterface,
    TableColumnInterface
} from "@wso2is/react-components";
import React, { ReactElement, ReactNode, SyntheticEvent, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Header, Icon, SemanticICONS, Popup } from "semantic-ui-react";
import {
    AppConstants,
    AppState,
    FeatureConfigInterface,
    UIConstants,
    getEmptyPlaceholderIllustrations,
    history
} from "../../../features/core";
import { GroupConstants } from "../../../features/groups/constants";
import { GroupsInterface } from "../../../features/groups/models";
import { UsersConstants } from "../users/constants";

interface GroupListProps extends SBACInterface<FeatureConfigInterface>,
    LoadableComponentInterface, TestableComponentInterface {

    /**
     * Advanced Search component.
     */
    advancedSearch?: ReactNode;
    /**
     * Default list item limit.
     */
    defaultListItemLimit?: number;
    /**
     * Groups list.
     */
    groupList: GroupsInterface[];
    /**
     * Group delete callback.
     * @param {GroupsInterface} group - Deleting group.
     */
    handleGroupDelete?: (group: GroupsInterface) => void;
    /**
     * On list item select callback.
     */
    onListItemClick?: (event: SyntheticEvent, group: GroupsInterface) => void;
    /**
     * Callback for the search query clear action.
     */
    onSearchQueryClear?: () => void;
    /**
     * Callback to be fired when clicked on the empty list placeholder action.
     */
    onEmptyListPlaceholderActionClick?: () => void;
    /**
     * Search query for the list.
     */
    searchQuery?: string;
    /**
     * Enable selection styles.
     */
    selection?: boolean;
    /**
     * Show list item actions.
     */
    showListItemActions?: boolean;
    /**
     * Show/Hide meta content.
     */
    showMetaContent?: boolean;
    /**
     * List of readOnly user stores.
     */
    readOnlyUserStores?: string[];
    /**
     * Toggle help panel visibility
     */
    showHelpPanel?: boolean;
    setShowHelpPanel: (value: boolean) => void;
}

/**
 * List component for Group Management list
 *
 * @param props contains the role list as a prop to populate
 */
export const GroupList: React.FunctionComponent<GroupListProps> = (props: GroupListProps): ReactElement => {

    const {
        advancedSearch,
        defaultListItemLimit,
        handleGroupDelete,
        isLoading,
        readOnlyUserStores,
        featureConfig,
        onEmptyListPlaceholderActionClick,
        onListItemClick,
        onSearchQueryClear,
        groupList,
        selection,
        searchQuery,
        showListItemActions,
        showMetaContent,
        showHelpPanel,
        setShowHelpPanel,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const allowedScopes: string = useSelector((state: AppState) => state?.auth?.scope);

    const [ showGroupDeleteConfirmation, setShowDeleteConfirmationModal ] = useState<boolean>(false);
    const [ currentDeletedGroup, setCurrentDeletedGroup ] = useState<GroupsInterface>();

    const handleGroupEdit = (groupId: string) => {
        history.push(AppConstants.getPaths().get("GROUP_EDIT").replace(":id", groupId));
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
                    data-testid={ `${ testId }-search-empty-placeholder` }
                    action={ (
                        <LinkButton
                            data-testid={ `${ testId }-search-empty-placeholder-clear-button` }
                            onClick={ onSearchQueryClear }
                        >
                            { t("console:manage.features.roles.list.emptyPlaceholders.search.action") }
                        </LinkButton>
                    ) }
                    image={ getEmptyPlaceholderIllustrations().emptySearch }
                    imageSize="tiny"
                    title={ t("console:manage.features.roles.list.emptyPlaceholders.search.title") }
                    subtitle={ [
                        t("console:manage.features.roles.list.emptyPlaceholders.search.subtitles.0",
                            { searchQuery: searchQuery }),
                        t("console:manage.features.roles.list.emptyPlaceholders.search.subtitles.1")
                    ] }
                />
            );
        }

        if (groupList?.length === 0) {
            return (
                <EmptyPlaceholder
                    data-testid={ `${ testId }-empty-list-empty-placeholder` }
                    action={ (
                        <PrimaryButton
                            data-testid={ `${ testId }-empty-list-empty-placeholder-add-button` }
                            onClick={ onEmptyListPlaceholderActionClick }
                        >
                            <Icon name="add"/>
                            { t("console:manage.features.roles.list.emptyPlaceholders.emptyRoleList.action",
                                { type: "Group" }) }
                        </PrimaryButton>
                    ) }
                    image={ getEmptyPlaceholderIllustrations().newList }
                    imageSize="tiny"
                    title={ t("console:manage.features.roles.list.emptyPlaceholders.emptyRoleList.title",
                        { type: "group" }) }
                    subtitle={ [
                        t("console:manage.features.roles.list.emptyPlaceholders.emptyRoleList.subtitles.0",
                            { type: "groups" }),
                        t("console:manage.features.roles.list.emptyPlaceholders.emptyRoleList.subtitles.1",
                            { type: "group" }),
                        t("console:manage.features.roles.list.emptyPlaceholders.emptyRoleList.subtitles.2",
                            { type: "group" })
                    ] }
                />
            );
        }

        return null;
    };

    /**
     * Resolves data table columns.
     *
     * @return {TableColumnInterface[]}
     */
    const resolveTableColumns = (): TableColumnInterface[] => {
        return [
            {
                allowToggleVisibility: false,
                dataIndex: "name",
                id: "name",
                key: "name",
                render: (group: GroupsInterface): ReactNode => (
                    <Header
                        image
                        as="h6"
                        className="header-with-icon"
                        data-testid={ `${ testId }-item-heading` }
                    >
                        <AppAvatar
                            image={ (
                                <AnimatedAvatar
                                    name={ group.displayName }
                                    size="mini"
                                    data-testid={ `${ testId }-item-image-inner` }
                                />
                            ) }
                            size="mini"
                            spaced="right"
                            data-testid={ `${ testId }-item-image` }
                        />
                        <Header.Content>
                            <div className="mt-2">{ group?.displayName?.split("/")[1] } </div>
                        </Header.Content>
                    </Header>
                ),
                title: t("console:manage.features.groups.list.columns.name")
            },
            {
                allowToggleVisibility: false,
                dataIndex: "type",
                id: "type",
                key: "type",
                render: (group: GroupsInterface): ReactNode => {
                    const grpName: string = resolveUserstore(group.displayName);
                    if (grpName === UsersConstants.CONSUMER_USERSTORE) {
                       return  "Local/Consumer"
                    }
                    return grpName.charAt(0).toUpperCase() + grpName.substr(1).toLowerCase()
                },
                title: (
                    <> 
                        Source
                        <Popup
                            trigger={
                                <div onClick={ () => {setShowHelpPanel(!showHelpPanel)} } className="inline" >
                                    <Icon disabled name='info circle' className="link pointing pl-1" />
                                </div>
                            }
                            content="Where group is managed."
                            position="top center"
                            size="mini"
                            hideOnScroll
                            inverted
                        /> 
                    </>
                )
            },
            {
                allowToggleVisibility: false,
                dataIndex: "action",
                id: "actions",
                key: "actions",
                textAlign: "right",
                title: null
            }
        ];
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
                hidden: (): boolean => !isFeatureEnabled(featureConfig?.groups,
                    GroupConstants.FEATURE_DICTIONARY.get("GROUP_READ")),
                icon: (group: GroupsInterface): SemanticICONS => {
                    const userStore = group?.displayName?.split("/").length > 1
                        ? group?.displayName?.split("/")[0]
                        : "PRIMARY";

                    return !isFeatureEnabled(featureConfig?.groups,
                        GroupConstants.FEATURE_DICTIONARY.get("GROUP_UPDATE"))
                    || readOnlyUserStores?.includes(userStore.toString())
                        ? "eye"
                        : "pencil alternate";
                },
                onClick: (e: SyntheticEvent, group: GroupsInterface): void =>
                    handleGroupEdit(group.id),
                popupText: (group: GroupsInterface): string => {
                    const userStore = group?.displayName?.split("/").length > 1
                        ? group?.displayName?.split("/")[0]
                        : "PRIMARY";

                    return !isFeatureEnabled(featureConfig?.groups,
                        GroupConstants.FEATURE_DICTIONARY.get("GROUP_UPDATE"))
                    || readOnlyUserStores?.includes(userStore.toString())
                        ? t("common:view")
                        : t("common:edit");
                },
                renderer: "semantic-icon"
            }
        ];

        actions.push({
            hidden: (group: GroupsInterface): boolean => {
                const userStore = group?.displayName?.split("/").length > 1
                    ? group?.displayName?.split("/")[0]
                    : "PRIMARY";

                return !hasRequiredScopes(featureConfig?.groups, featureConfig?.groups?.scopes?.delete, allowedScopes)
                    || readOnlyUserStores?.includes(userStore.toString());
            },
            icon: (): SemanticICONS => "trash alternate",
            onClick: (e: SyntheticEvent, group: GroupsInterface): void => {
                setCurrentDeletedGroup(group);
                setShowDeleteConfirmationModal(!showGroupDeleteConfirmation);
            },
            popupText: (): string => t("console:manage.features.roles.list.popups.delete", { type: "Group" }),
            renderer: "semantic-icon"
        });

        return actions;
    };

    return (
        <>
            <DataTable<GroupsInterface>
                showHeader
                className="groups-list"
                externalSearch={ advancedSearch }
                isLoading={ isLoading }
                loadingStateOptions={ {
                    count: defaultListItemLimit ?? UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT,
                    imageType: "square"
                } }
                actions={ resolveTableActions() }
                columns={ resolveTableColumns() }
                data={ groupList }
                onRowClick={
                    (e: SyntheticEvent, group: GroupsInterface): void => {
                        handleGroupEdit(group?.id);
                        onListItemClick(e, group);
                    }
                }
                placeholders={ showPlaceholders() }
                selectable={ selection }
                transparent={ !isLoading && (showPlaceholders() !== null) }
                data-testid={ testId }
            />
            {
                showGroupDeleteConfirmation &&
                <ConfirmationModal
                    data-testid={ `${ testId }-delete-item-confirmation-modal` }
                    onClose={ (): void => setShowDeleteConfirmationModal(false) }
                    type="warning"
                    open={ showGroupDeleteConfirmation }
                    assertion={ currentDeletedGroup?.displayName?.split("/")[1] }
                    assertionHint={
                        (
                            <p>
                                <Trans
                                    i18nKey={ "console:manage.features.roles.list.confirmations.deleteItem." +
                                    "assertionHint" }
                                    tOptions={ { roleName: currentDeletedGroup?.displayName?.split("/")[1] } }
                                >
                                    Please type
                                    <strong>
                                        { currentDeletedGroup?.displayName?.split("/")[1] }
                                    </strong> to confirm.
                                </Trans>
                            </p>
                        )
                    }
                    assertionType="input"
                    primaryAction="Confirm"
                    secondaryAction="Cancel"
                    onSecondaryActionClick={ (): void => setShowDeleteConfirmationModal(false) }
                    onPrimaryActionClick={ (): void => {
                        handleGroupDelete(currentDeletedGroup);
                        setShowDeleteConfirmationModal(false);
                    } }
                    closeOnDimmerClick={ false }
                >
                    <ConfirmationModal.Header>
                        { t("console:manage.features.roles.list.confirmations.deleteItem.header") }
                    </ConfirmationModal.Header>
                    <ConfirmationModal.Message attached warning>
                        { t("console:manage.features.roles.list.confirmations.deleteItem.message",
                            { type: "group" }) }
                    </ConfirmationModal.Message>
                    <ConfirmationModal.Content>
                        { t("console:manage.features.roles.list.confirmations.deleteItem.content",
                            { type: "group" }) }
                    </ConfirmationModal.Content>
                </ConfirmationModal>
            }
        </>
    );
};

/**
 * Default props for the component.
 */
GroupList.defaultProps = {
    selection: true,
    showListItemActions: true,
    showMetaContent: true
};