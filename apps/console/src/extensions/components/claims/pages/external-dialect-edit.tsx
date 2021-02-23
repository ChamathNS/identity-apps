/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { getAllExternalClaims } from "@wso2is/core/api";
import { AlertLevels, ClaimDialect, ExternalClaim, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { ConfirmationModal, DangerZone, DangerZoneGroup, EmphasizedSegment } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Divider, Grid, Header, Placeholder } from "semantic-ui-react";
import { AppConstants, history, sortList } from "../../../../features/core";
import { deleteADialect, getADialect } from "../../../../features/claims/api";
import { EditDialectDetails, EditExternalClaims } from "../components";
import { ClaimManagementConstants } from "../../../../features/claims/constants";
import { resolveType } from "../../../../features/claims/utils";

/**
 * Props for the External Dialects edit page.
 */
interface ExternalDialectEditPageInterface extends TestableComponentInterface {
    /**
     * Attribute MAPPING ID.
     */
    id: string;
    /**
     * Attribute type
     */
    attributeType?: string;
}

/**
 * This renders the edit external dialect page
 *
 * @param {ExternalDialectEditPageInterface & RouteComponentProps<RouteParams>} props - Props injected to the component
 *
 * @return {React.ReactElement}
 */
const ExternalDialectEditPage: FunctionComponent<ExternalDialectEditPageInterface> = (
    props: ExternalDialectEditPageInterface
): ReactElement => {
    const { attributeType, [ "data-testid" ]: testId, id: dialectId } = props;

    const [ dialect, setDialect ] = useState<ClaimDialect>(null);
    const [ claims, setClaims ] = useState<ExternalClaim[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ confirmDelete, setConfirmDelete ] = useState(false);

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const deleteConfirmation = (): ReactElement => (
        <ConfirmationModal
            onClose={ (): void => setConfirmDelete(false) }
            type="warning"
            open={ confirmDelete }
            assertion={ dialect.dialectURI }
            assertionHint={
                <p>
                    <Trans i18nKey="console:manage.features.claims.dialects.confirmations.hint">
                        Please type <strong>{ { confirm: dialect.dialectURI } }</strong> to confirm.
                    </Trans>
                </p>
            }
            assertionType="input"
            primaryAction={ t("console:manage.features.claims.dialects.confirmations.action") }
            secondaryAction={ t("common:cancel") }
            onSecondaryActionClick={ (): void => setConfirmDelete(false) }
            onPrimaryActionClick={ (): void => deleteDialect(dialect.id) }
            data-testid={ `${ testId }-delete-confirmation-modal` }
            closeOnDimmerClick={ false }
        >
            <ConfirmationModal.Header data-testid={ `${ testId }-delete-confirmation-modal-header` }>
                { t("console:manage.features.claims.dialects.confirmations.header") }
            </ConfirmationModal.Header>
            <ConfirmationModal.Message attached warning data-testid={ `${ testId }-delete-confirmation-modal-message` }>
                { t("console:manage.features.claims.dialects.confirmations.message") }
            </ConfirmationModal.Message>
            <ConfirmationModal.Content data-testid={ `${ testId }-delete-confirmation-modal-content` }>
                { t("console:manage.features.claims.dialects.confirmations.content") }
            </ConfirmationModal.Content>
        </ConfirmationModal>
    );

    /**
     * Fetch the dialect.
     */
    const getDialect = () => {
        getADialect(dialectId)
            .then((response) => {
                setDialect(response);
            })
            .catch((error) => {
                dispatch(
                    addAlert({
                        description:
                            error?.description ||
                            t(
                                "console:manage.features.claims.dialects.notifications." +
                                "fetchADialect.genericError.description"
                            ),
                        level: AlertLevels.ERROR,
                        message:
                            error?.message ||
                            t(
                                "console:manage.features.claims.dialects.notifications." +
                                "fetchADialect.genericError.message"
                            )
                    })
                );
            });
    };

    useEffect(() => {
        dialectId && getDialect();
    }, [ dialectId ]);

    /**
     * Fetch external claims.
     *
     * @param {number} limit.
     * @param {number} offset.
     * @param {string} sort.
     * @param {string} filter.
     */
    const getExternalClaims = (limit?: number, offset?: number, sort?: string, filter?: string) => {
        dialectId && setIsLoading(true);
        dialectId && setClaims([]);
        dialectId &&
            getAllExternalClaims(dialectId, {
                filter,
                limit,
                offset,
                sort
            })
                .then((response) => {
                    // Hide identity claims in SCIM
                    const claims: ExternalClaim[] = [];
                    if (attributeType == ClaimManagementConstants.SCIM) {
                        response.forEach((claim: ExternalClaim) => {
                            if (!claim.mappedLocalClaimURI.match(/\/identity\//)) {
                                claims.push(claim);
                            }
                        });
                    } else {
                        claims.push(...response);
                    }
                    setClaims(sortList(claims, "claimURI", true));
                })
                .catch((error) => {
                    dispatch(
                        addAlert({
                            description:
                                error?.response?.data?.description ||
                                t(
                                    "console:manage.features.claims.dialects.notifications." +
                                    "fetchExternalClaims.genericError.description",
                                    { type: resolveType(attributeType) }
                                ),
                            level: AlertLevels.ERROR,
                            message:
                                error?.response?.data?.message ||
                                t(
                                    "console:manage.features.claims.dialects.notifications." +
                                    "fetchExternalClaims.genericError.message"
                                )
                        })
                    );
                })
                .finally(() => {
                    setIsLoading(false);
                });
    };

    useEffect(() => {
        getExternalClaims();
    }, [ dialectId ]);

    /**
     * This deletes a dialect
     * @param {string} dialectID
     */
    const deleteDialect = (dialectID: string) => {
        deleteADialect(dialectID)
            .then(() => {
                history.push(AppConstants.getPaths().get("CLAIM_DIALECTS"));
                dispatch(
                    addAlert({
                        description: t(
                            "console:manage.features.claims.dialects.notifications." +
                            "deleteDialect.success.description",
                            { type: resolveType(attributeType, true) }
                        ),
                        level: AlertLevels.SUCCESS,
                        message: t(
                            "console:manage.features.claims.dialects.notifications." + "deleteDialect.success.message"
                        )
                    })
                );
            })
            .catch((error) => {
                dispatch(
                    addAlert({
                        description:
                            error?.description ||
                            t(
                                "console:manage.features.claims.dialects.notifications." +
                                "deleteDialect.genericError.description",
                                { type: resolveType(attributeType, true) }
                            ),
                        level: AlertLevels.ERROR,
                        message:
                            error?.message ||
                            t(
                                "console:manage.features.claims.dialects.notifications." +
                                "deleteDialect.genericError.message"
                            )
                    })
                );
            });
    };

    return (
        <>
            {/* <Grid>
                <Grid.Row columns={ 1 }>
                    <Grid.Column width={ 16 }>
                        <Header as="h4">
                            { t("console:manage.features.claims.dialects.pageLayout.edit.updateDialectURI",
                                { type: resolveType(attributeType, true) }) }
                        </Header>
                        <EmphasizedSegment>
                            { isLoading ? (
                                <Placeholder>
                                    <Placeholder.Line length="short" />
                                    <Placeholder.Line length="medium" />
                                </Placeholder>
                            ) : (
                                    <EditDialectDetails
                                        dialect={ dialect }
                                        data-testid={ `${ testId }-edit-dialect-details` }
                                        attributeType={ attributeType }
                                    />
                                ) }
                        </EmphasizedSegment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

            <Divider hidden />

            <Grid columns={ 1 }>
                <Grid.Column width={ 16 }>
                    <Header as="h4">
                        { t("console:manage.features.claims.dialects.pageLayout.edit.updateExternalAttributes",
                            { type: resolveType(attributeType, true) }) }
                    </Header>
                </Grid.Column>
            </Grid>

            <Divider hidden />

            <Divider hidden /> */}
            <EditExternalClaims
                dialectID={ dialectId }
                isLoading={ isLoading }
                claims={ claims }
                update={ getExternalClaims }
                data-testid={ `${ testId }-edit-external-claims` }
                attributeType={ attributeType }
            />

            <Divider hidden />

            {/* <Grid>
                <Grid.Row columns={ 1 }>
                    <Grid.Column width={ 16 }>
                        <DangerZoneGroup
                            sectionHeader={ t("common:dangerZone") }
                            data-testid={ `${ testId }-danger-zone-group` }
                        >
                            <DangerZone
                                actionTitle={ t("console:manage.features.claims.dialects.dangerZone.actionTitle",
                                    { type: resolveType(attributeType, true) }) }
                                header={ t("console:manage.features.claims.dialects.dangerZone.header",
                                    { type: resolveType(attributeType, true) }) }
                                subheader={ t("console:manage.features.claims.dialects.dangerZone.subheader",
                                    { type: resolveType(attributeType) }) }
                                onActionClick={ () => setConfirmDelete(true) }
                                data-testid={ `${ testId }-dialect-delete-danger-zone` }
                            />
                        </DangerZoneGroup>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            { confirmDelete && deleteConfirmation() } */}
        </>
    );
};

/**
 * Default props for the component.
 */
ExternalDialectEditPage.defaultProps = {
    attributeType: ClaimManagementConstants.OTHERS,
    "data-testid": "external-dialect-edit"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default ExternalDialectEditPage;