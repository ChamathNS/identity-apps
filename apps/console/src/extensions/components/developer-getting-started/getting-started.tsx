/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { AlertLevels, TestableComponentInterface } from "@wso2is/core/models";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { 
    GenericIcon, 
    Heading, 
    LinkButton, 
    PageLayout, 
    Text, 
    ListLayout, 
    EmptyPlaceholder,
    PrimaryButton
} from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useState, MouseEvent, useEffect } from "react";
import { Card, Divider, Grid, Icon, Modal, DropdownProps, PaginationProps } from "semantic-ui-react";
import { addAlert } from "@wso2is/core/store";
import { 
    AppConstants, 
    history, 
    UIConstants, 
    getEmptyPlaceholderIllustrations, 
} from "../../../features/core";
import { ApplicationList } from "../../../features/applications/components";
import { ReactComponent as SupportHeadsetIcon } from "../../assets/images/icons/support-headset-icon.svg";
import { getApplicationList } from "../../../features/applications/api";
import { ApplicationListInterface } from "../../../features/applications/models";
import MFAIllustration from "../../assets/images/illustrations/mfa-illustration.svg";
import SocialLoginIllustration from "../../assets/images/illustrations/social-login-illustration.svg";
import RegisterApplicationIllustration from "../../assets/images/illustrations/register-application-illustration.svg";

/**
 * Proptypes for the developer getting started page component.
 */
type DeveloperGettingStartedPageInterface = TestableComponentInterface;

/**
 * Developer view Getting started page.
 *
 * @param {DeveloperGettingStartedPageInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
const DeveloperGettingStartedPage: FunctionComponent<DeveloperGettingStartedPageInterface> = (
    props: DeveloperGettingStartedPageInterface
): ReactElement => {

    const {
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const [ showApplicationModal, setShowApplicationModal ] = useState<boolean>(false);
    const [ listOffset, setListOffset ] = useState<number>(0);
    const [ listItemLimit, setListItemLimit ] = useState<number>(UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT);
    const [ appList, setAppList ] = useState<ApplicationListInterface>({});
    const [ isApplicationListRequestLoading, setApplicationListRequestLoading ] = useState<boolean>(false);

    /**
     * Called on every `listOffset` & `listItemLimit` change.
     */
    useEffect(() => {
        getAppLists(listItemLimit, listOffset, null);
    }, [ listOffset, listItemLimit ]);

    /**
     * Retrieves the list of applications.
     *
     * @param {number} limit - List limit.
     * @param {number} offset - List offset.
     * @param {string} filter - Search query.
     */
    const getAppLists = (limit: number, offset: number, filter: string): void => {
        setApplicationListRequestLoading(true);

        getApplicationList(limit, offset, filter)
            .then((response) => {
                setAppList(response);
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.description) {
                    dispatch(addAlert({
                        description: error.response.data.description,
                        level: AlertLevels.ERROR,
                        message: t("console:develop.features.applications.notifications.fetchApplications" +
                            ".error.message")
                    }));

                    return;
                }

                dispatch(addAlert({
                    description: t("console:develop.features.applications.notifications.fetchApplications" +
                        ".genericError.description"),
                    level: AlertLevels.ERROR,
                    message: t("console:develop.features.applications.notifications.fetchApplications." + 
                        "genericError.message")
                }));
            })
            .finally(() => {
                setApplicationListRequestLoading(false);
            });
    };

    /**
     * Handles per page dropdown page.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event - Mouse event.
     * @param {DropdownProps} data - Dropdown data.
     */
    const handleItemsPerPageDropdownChange = (event: MouseEvent<HTMLAnchorElement>,
        data: DropdownProps): void => {
        setListItemLimit(data.value as number);
    };

    /**
     * Handles the pagination change.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event - Mouse event.
     * @param {PaginationProps} data - Pagination component data.
     */
    const handlePaginationChange = (event: MouseEvent<HTMLAnchorElement>, data: PaginationProps): void => {
        setListOffset((data.activePage as number - 1) * listItemLimit);
    };

    return (
        <PageLayout contentTopMargin={ false } data-testid={ testId }>
            <div className="developer-portal page getting-started-page">
                <div className="getting-started-section">
                    <Grid>
                        <Grid.Row columns={ 2 }>
                            <Grid.Column>
                                <Heading as="h1">Getting Started</Heading>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column
                                className="stackable"
                                largeScreen={ 16 }
                                widescreen={ 16 }
                                computer={ 16 }
                                tablet={ 16 }
                                mobile={ 16 }
                            >
                                <Card
                                    fluid
                                    className="basic-card no-hover section-card auth-demo-card"
                                    style={ {
                                        backgroundImage: `url(${ RegisterApplicationIllustration })`
                                    } }
                                >
                                    <Card.Content>
                                        <Grid>
                                            <Grid.Row>
                                                <Grid.Column computer={ 8 } tablet={ 8 } mobile={ 16 }>
                                                    <Heading as="h3">Onboard an Application</Heading>
                                                    <Text muted>
                                                        Use our sample apps to get familiar with Asgardeo or
                                                        use an SDK to integrate Asgardeo with your own application.
                                                    </Text>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                    </Card.Content>
                                    <Card.Content className="action-container" extra>
                                        <LinkButton
                                            className="quick-start-action"
                                            onClick={
                                                () => history.push(AppConstants.getPaths().get("APPLICATION_TEMPLATES"))
                                            }
                                            compact
                                        >
                                            <span className="quick-start-action-text">
                                                Register Application
                                            </span>
                                            <Icon className="ml-1" name="caret right"/>
                                        </LinkButton>
                                    </Card.Content>
                                </Card>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

                <Divider hidden/>

                <div className="mfa-section">
                    <Grid>
                        <Grid.Row stretched>
                            <Grid.Column computer={ 8 } tablet={ 16 } mobile={ 16 }>
                                <Card
                                    fluid
                                    className="basic-card no-hover section-card mfa-card mb-5"
                                    style={ {
                                        backgroundImage: `url(${ MFAIllustration })`
                                    } }
                                >
                                    <Card.Content>
                                        <Grid>
                                            <Grid.Row>
                                                <Grid.Column
                                                    largeScreen={ 14 }
                                                    computer={ 14 }
                                                    tablet={ 15 }
                                                    mobile={ 15 }
                                                >
                                                    <Heading as="h3">Add Stronger Authentication</Heading>
                                                    <Text muted>
                                                        Protect your applications and its users by adding
                                                        multi-factor authentication with Asgardeo.
                                                    </Text>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                    </Card.Content>
                                    <Card.Content className="action-container" extra>
                                        <LinkButton 
                                            className="quick-start-action" 
                                            onClick={
                                                () => setShowApplicationModal(true)
                                            }
                                            compact
                                        >
                                            <span className="quick-start-action-text">
                                                Set Up Multi-Factor Authentication
                                            </span>
                                            <Icon className="ml-1" name="caret right"/>
                                        </LinkButton>
                                    </Card.Content>
                                </Card>
                                {
                                    showApplicationModal &&
                                    <Modal
                                        data-testid={ testId }
                                        open={ true }
                                        className="wizard application-create-wizard"
                                        dimmer="blurring"
                                        size="large"
                                        onClose={ () => setShowApplicationModal(false) }
                                        closeOnDimmerClick={ false }
                                        closeOnEscape
                                    >
                                        <Modal.Header className="wizard-header">
                                            { "Add strong authentication" }
                                            <Heading as="h6">
                                                { "Select an application you want to add stronger authentication" }
                                            </Heading>
                                        </Modal.Header>
                                        <Modal.Content className="content-container" scrolling>
                                            <ListLayout
                                                currentListSize={ appList.count }
                                                listItemLimit={ listItemLimit }
                                                onItemsPerPageDropdownChange={ handleItemsPerPageDropdownChange }
                                                onPageChange={ handlePaginationChange }
                                                showPagination={ appList?.totalResults !== 0 }
                                                totalPages={ Math.ceil(appList.totalResults / listItemLimit) }
                                                totalListSize={ appList.totalResults }
                                                data-testid={ `${ testId }-list-layout` }
                                                showTopActionPanel={ false }
                                            >
                                                <ApplicationList
                                                    isSetStrongerAuth
                                                    list={ appList }
                                                    onEmptyListPlaceholderActionClick={
                                                        () => history.push(
                                                            AppConstants.getPaths().get("APPLICATION_TEMPLATES")
                                                        )
                                                    }
                                                    data-testid={ `${ testId }-list` }
                                                />
                                            </ListLayout>
                                        </Modal.Content>
                                        <Modal.Actions>
                                            <Grid>
                                                <Grid.Row column={ 1 }>
                                                    <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                                                        <LinkButton
                                                            data-testid={ `${ testId }-cancel-button` }
                                                            floated="left"
                                                            onClick={ () => setShowApplicationModal(false) }
                                                        >
                                                            { t("common:cancel") }
                                                        </LinkButton>
                                                    </Grid.Column>
                                                </Grid.Row>
                                            </Grid>
                                        </Modal.Actions>
                                    </Modal>
                                }
                            </Grid.Column>
                            <Grid.Column computer={ 8 } tablet={ 16 } mobile={ 16 }>
                                <Card
                                    fluid
                                    className="basic-card no-hover section-card social-login-card mb-5"
                                    style={ {
                                        backgroundImage: `url(${ SocialLoginIllustration })`
                                    } }
                                >
                                    <Card.Content>
                                        <Grid>
                                            <Grid.Row>
                                                <Grid.Column
                                                    largeScreen={ 14 }
                                                    computer={ 14 }
                                                    tablet={ 15 }
                                                    mobile={ 15 }
                                                >
                                                    <Heading as="h3">Add Social Login</Heading>
                                                    <Text muted>
                                                        Let your users log in to your application with an
                                                        identity provider of their choice.
                                                    </Text>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                    </Card.Content>
                                    <Card.Content className="action-container" extra>
                                        <LinkButton
                                            className="quick-start-action"
                                            onClick={
                                                () => history.push(AppConstants.getPaths().get("IDP"))
                                            }
                                            compact
                                        >
                                            <span className="quick-start-action-text">
                                                Set Up Social Connections
                                            </span>
                                            <Icon className="ml-1" name="caret right"/>
                                        </LinkButton>
                                    </Card.Content>
                                </Card>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

                <Divider hidden />

                <div className="community-suport-section">
                    <Grid>
                        <Grid.Row>
                            <Grid.Column>
                                <div className="support-section">
                                    <div className="mr-2">
                                        <GenericIcon
                                            transparent
                                            icon={ SupportHeadsetIcon }
                                            size="mini"
                                            fill="default"
                                            spaced="right"
                                        />
                                    </div>
                                    <div>
                                        <Heading as="h5" compact>Help & Support</Heading>
                                        <Text muted>Write to
                                            { " " }
                                            <a
                                                href={ "mailto:beta@asgardeo.io" }
                                            >
                                                beta@asgardeo.io
                                            </a>
                                            { " " }
                                            to get expert advice on all your queries.
                                        </Text>
                                    </div>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
            </div>
        </PageLayout>
    );
};

/**
 * Default props for the component.
 */
DeveloperGettingStartedPage.defaultProps = {
    "data-testid": "developer-quick-start-page"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default DeveloperGettingStartedPage;