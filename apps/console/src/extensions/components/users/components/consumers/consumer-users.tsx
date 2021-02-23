/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

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

import { AlertInterface, AlertLevels, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import {
    EmptyPlaceholder,
    ListLayout
} from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { DropdownProps, PaginationProps } from "semantic-ui-react";
import { ConsumerUsersList } from "./consumer-users-list";
import {
    AdvancedSearchWithBasicFilters,
    AppState,
    FeatureConfigInterface,
    UIConstants,
    getEmptyPlaceholderIllustrations
} from "../../../../../features/core";
import { RealmConfigInterface } from "../../../../../features/server-configurations";
import { deleteUser } from "../../../../../features/users/api";

import { UserListInterface } from "../../../../../features/users/models";
import { UsersConstants } from "../../constants";

/**
 * Props for the consumer users listing page.
 */
interface ConsumerUsersPageInterface extends TestableComponentInterface {
    consumersUsersList: UserListInterface;
    getUsersList: (limit: number, offset: number, filter: string, attribute: string, domain: string) => void;
    isConsumersListRequestLoading: boolean;
    onEmptyListPlaceholderActionClick?: () => void;
}

/**
 * Temporary value to append to the list limit to figure out if the next button is there.
 * @type {number}
 */
const TEMP_RESOURCE_LIST_ITEM_LIMIT_OFFSET: number = 1;

/**
 * Consumer Users info page.
 *
 * @param {ConsumerUsersPageInterface} props - Props injected to the component.
 * @return {React.ReactElement}
 */
const ConsumerUsersPage: FunctionComponent<ConsumerUsersPageInterface> = (
    props: ConsumerUsersPageInterface
): ReactElement => {

    const {
        isConsumersListRequestLoading,
        getUsersList,
        consumersUsersList,
        onEmptyListPlaceholderActionClick,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const featureConfig: FeatureConfigInterface = useSelector((state: AppState) => state.config.ui.features);

    const [ searchQuery, setSearchQuery ] = useState<string>("");
    const [ listOffset, setListOffset ] = useState<number>(0);
    const [ listItemLimit, setListItemLimit ] = useState<number>(UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT);
    const [ usersList, setUsersList ] = useState<UserListInterface>({});
    const [ userListMetaContent, setUserListMetaContent ] = useState(undefined);
    const [ userStoreOptions, setUserStoresList ] = useState([]);
    const [ triggerClearQuery, setTriggerClearQuery ] = useState<boolean>(false);
    const [ readOnlyUserStoresList, setReadOnlyUserStoresList ] = useState<string[]>(undefined);
    const [ userStoreError, setUserStoreError ] = useState(false);
    const [ emailVerificationEnabled, setEmailVerificationEnabled ] = useState<boolean>(undefined);
    const [ isNextPageAvailable, setIsNextPageAvailable ] = useState<boolean>(undefined);
    const [ realmConfigs, setRealmConfigs ] = useState<RealmConfigInterface>(undefined);

    /**
     * Set users list.
     */
    useEffect(() => {
        if (!consumersUsersList) {
            return;
        }

        setUsersList(consumersUsersList);
    }, [ consumersUsersList ]);

    /**
     * Handles the `onSearchQueryClear` callback action.
     */
    const handleSearchQueryClear = (): void => {
        setTriggerClearQuery(!triggerClearQuery);
        setSearchQuery("");
        getUsersList(listItemLimit, listOffset, null, null, UsersConstants.CONSUMER_USERSTORE);
    };

    /**
     * Dispatches the alert object to the redux store.
     *
     * @param {AlertInterface} alert - Alert object.
     */
    const handleAlerts = (alert: AlertInterface) => {
        dispatch(addAlert(alert));
    };

    /**
     * Handles the `onFilter` callback action from the
     * users search component.
     *
     * @param {string} query - Search query.
     */
    const handleUserFilter = (query: string): void => {
        if (query === "userName sw ") {
            getUsersList(listItemLimit, listOffset, null, null, UsersConstants.CONSUMER_USERSTORE);
            return;
        }

        setSearchQuery(query);
        getUsersList(listItemLimit, listOffset, query, null, UsersConstants.CONSUMER_USERSTORE);
    };

    const handlePaginationChange = (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
        setListOffset((data.activePage as number - 1) * listItemLimit);
    };

    const handleItemsPerPageDropdownChange = (event: React.MouseEvent<HTMLAnchorElement>, data: DropdownProps) => {
        setListItemLimit(data.value as number);
    };

    const handleUserDelete = (userId: string): void => {
        deleteUser(userId)
            .then(() => {
                handleAlerts({
                    description: t(
                        "console:manage.features.users.notifications.deleteUser.success.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "console:manage.features.users.notifications.deleteUser.success.message"
                    )
                });
                getUsersList(listItemLimit, listOffset, null, null, UsersConstants.CONSUMER_USERSTORE);
                getUsersList(listItemLimit, listOffset, null, null, null);
            });
    };

    return (
        <ListLayout
            // TODO add sorting functionality.
            advancedSearch={ (
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
                        }
                    ] }
                    filterAttributePlaceholder={
                        t("console:manage.features.users.advancedSearch.form.inputs.filterAttribute.placeholder")
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
                    triggerClearQuery={ triggerClearQuery }
                />
            ) }
            currentListSize={ usersList.itemsPerPage }
            listItemLimit={ listItemLimit }
            onItemsPerPageDropdownChange={ handleItemsPerPageDropdownChange }
            data-testid="user-mgt-user-list-layout"
            onPageChange={ handlePaginationChange }
            // TODO: Enable this when the Data table component issue is fixed.
            // rightActionPanel={
            //     (
            //         <>
            //             <Popup
            //                 className={ "list-options-popup" }
            //                 flowing
            //                 basic
            //                 content={
            //                     <UsersListOptionsComponent
            //                         data-testid="user-mgt-user-list-meta-columns"
            //                         handleMetaColumnChange={ handleMetaColumnChange }
            //                         userListMetaContent={ userListMetaContent }
            //                     />
            //                 }
            //                 position="bottom left"
            //                 on="click"
            //                 pinned
            //                 trigger={
            //                     <Button
            //                         data-testid="user-mgt-user-list-meta-columns-button"
            //                         className="meta-columns-button"
            //                         basic
            //                     >
            //                         <Icon name="columns"/>
            //                         { t("console:manage.features.users.buttons.metaColumnBtn") }
            //                     </Button>
            //                 }
            //             />
            //         </>
            //     )
            // }
            showPagination={ true }
            showTopActionPanel={ isConsumersListRequestLoading
            || !(!searchQuery
                && !userStoreError
                && userStoreOptions.length < 3
                && usersList?.totalResults <= 0) }
            totalPages={ Math.ceil(usersList.totalResults / listItemLimit) }
            totalListSize={ usersList.totalResults }
            paginationOptions={ {
                disableNextButton: !isNextPageAvailable
            } }
        >
            { userStoreError
                ? <EmptyPlaceholder
                    subtitle={ [ t("console:manage.features.users.placeholders.userstoreError.subtitles.0"),
                        t("console:manage.features.users.placeholders.userstoreError.subtitles.1")     ] }
                    title={ t("console:manage.features.users.placeholders.userstoreError.title") }
                    image={ getEmptyPlaceholderIllustrations().genericError }
                    imageSize="tiny"
                />
                : <ConsumerUsersList
                    advancedSearch={ (
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
                            triggerClearQuery={ triggerClearQuery }
                        />
                    ) }
                    usersList={ usersList }
                    handleUserDelete={ handleUserDelete }
                    userMetaListContent={ userListMetaContent }
                    isLoading={ isConsumersListRequestLoading }
                    realmConfigs={ realmConfigs }
                    onEmptyListPlaceholderActionClick={ () => onEmptyListPlaceholderActionClick() }
                    onSearchQueryClear={ handleSearchQueryClear }
                    searchQuery={ searchQuery }
                    data-testid="user-mgt-user-list"
                    readOnlyUserStores={ readOnlyUserStoresList }
                    featureConfig={ featureConfig }
                    userEditPath={ UsersConstants.getPaths().get("CONSUMER_USERS_EDIT_PATH") }
                />
            }
        </ListLayout>
    );
};

/**
 * Default props for the component.
 */
ConsumerUsersPage.defaultProps = {
    "data-testid": "users"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default ConsumerUsersPage;