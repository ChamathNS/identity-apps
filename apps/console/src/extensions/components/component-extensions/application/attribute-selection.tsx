/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { TestableComponentInterface } from "@wso2is/core/models";
import {
    ConfirmationModal,
    ContentLoader,
    EmptyPlaceholder,
    Heading,
    Hint,
    PrimaryButton
} from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button, Checkbox, Grid, Icon, Input, Segment, Table } from "semantic-ui-react";
import {
    AttributeSelectionWizardOtherDialect
} from "../../../../features/applications/components/settings/attribute-management/attirbute-selection-wizard-other-dialect";
import {
    AttributeListItem
} from "../../../../features/applications/components/settings/attribute-management/attribute-list-item";
import {
    AttributeSelectionWizard
} from "../../../../features/applications/components/settings/attribute-management/attribute-selection-wizard";
import {
    ExtendedClaimInterface,
    ExtendedClaimMappingInterface,
    ExtendedExternalClaimInterface,
    SelectedDialectInterface
} from "../../../../features/applications/components/settings/attribute-management/attribute-settings";
import { AppConstants, getEmptyPlaceholderIllustrations, history } from "../../../../features/core";
import {
    ClaimConfigurationInterface,
    ClaimMappingInterface,
    RequestedClaimConfigurationInterface
} from "../../../../features/applications/models";
import { ClaimManagementConstants } from "../../../../features/claims/constants";
import { isIdentityClaim } from "./user-attribute-settings";


interface AttributeSelectionPropsInterface extends TestableComponentInterface {
    claims: ExtendedClaimInterface[];
    setClaims: any;
    externalClaims: ExtendedExternalClaimInterface[];
    setExternalClaims: any;
    selectedClaims: ExtendedClaimInterface[];
    selectedExternalClaims: ExtendedExternalClaimInterface[];
    setSelectedClaims: any;
    setSelectedExternalClaims: any;
    selectedDialect: SelectedDialectInterface;
    selectedSubjectValue: string;
    claimMapping: ExtendedClaimMappingInterface[];
    setClaimMapping: any;
    createMapping: any;
    removeMapping: any;
    getCurrentMapping: any;
    updateClaimMapping: any;
    addToClaimMapping: any;
    claimConfigurations: ClaimConfigurationInterface;
    claimMappingOn: boolean;
    defaultSubjectAttribute: string;
    showClaimMappingRevertConfirmation?: (confirmation: boolean) => void;
    setClaimMappingOn: (mappingOn: boolean) => void;
    claimMappingError: boolean;
    /**
     * Make the form read only.
     */
    readOnly?: boolean;
}

/**
 * Attribute selection component.
 *
 * @param {AttributeSelectionPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const AttributeSelection: FunctionComponent<AttributeSelectionPropsInterface> = (
    props: AttributeSelectionPropsInterface
): ReactElement => {

    const {
        claims,
        setClaims,
        externalClaims,
        selectedClaims,
        setExternalClaims,
        selectedExternalClaims,
        setSelectedClaims,
        setSelectedExternalClaims,
        selectedDialect,
        selectedSubjectValue,
        setClaimMapping,
        createMapping,
        removeMapping,
        getCurrentMapping,
        updateClaimMapping,
        addToClaimMapping,
        claimConfigurations,
        claimMappingOn,
        defaultSubjectAttribute,
        showClaimMappingRevertConfirmation,
        setClaimMappingOn,
        claimMappingError,
        readOnly,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const [availableClaims, setAvailableClaims] = useState<ExtendedClaimInterface[]>([]);
    const [availableExternalClaims, setAvailableExternalClaims] = useState<ExtendedExternalClaimInterface[]>([]);
    const [isDefaultMappingChanged, setIsDefaultMappingChanged] = useState<boolean>(false);

    const [filterSelectedClaims, setFilterSelectedClaims] = useState<ExtendedClaimInterface[]>([]);
    const [
        filterSelectedExternalClaims,
        setFilterSelectedExternalClaims
    ] = useState<ExtendedExternalClaimInterface[]>([]);

    const [initializationFinished, setInitializationFinished] = useState(false);

    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [ showDeleteConfirmationModal, setShowDeleteConfirmationModal ] = useState<boolean>(false);

    const initValue = useRef(false);

    useEffect(() => {
        const tempFilterSelectedExternalClaims = [...filterSelectedExternalClaims];
        claimConfigurations?.claimMappings?.map((claim) => {
            if (
                !filterSelectedExternalClaims.find(
                    (selectedExternalClaim) => selectedExternalClaim.mappedLocalClaimURI === claim.localClaim.uri
                )
            ) {
                tempFilterSelectedExternalClaims.push(
                    availableExternalClaims.find(
                        (availableClaim) => availableClaim.mappedLocalClaimURI === claim.localClaim.uri
                    )
                );
            }
        });
        setSelectedExternalClaims(tempFilterSelectedExternalClaims);
        setFilterSelectedExternalClaims(tempFilterSelectedExternalClaims);
    }, [claimConfigurations]);

    const updateMandatory = (claimURI: string, mandatory: boolean) => {
        if (selectedDialect.localDialect) {
            const localClaims = [...selectedClaims];
            localClaims.forEach((mapping) => {
                if (mapping.claimURI === claimURI) {
                    mapping.mandatory = mandatory;
                }
            });
            setSelectedClaims(localClaims);
        } else {
            const externalClaims = [...selectedExternalClaims];
            externalClaims.forEach((mapping) => {
                if (mapping.claimURI === claimURI) {
                    mapping.mandatory = mandatory;
                }
            });
            setSelectedExternalClaims(externalClaims);
        }
    };

    const updateRequested = (claimURI: string, requested: boolean) => {
        if (selectedDialect.localDialect) {
            const localClaims = [...selectedClaims];
            localClaims.forEach((mapping) => {
                if (mapping.claimURI === claimURI) {
                    mapping.requested = requested;
                }
            });
            setSelectedClaims(localClaims);
        }
    };

    const getInitiallySelectedClaimsURI = ((): string[] => {
        const requestURI: string[] = [];
        if (claimConfigurations?.dialect === "CUSTOM") {
            claimConfigurations.claimMappings?.map((element: ClaimMappingInterface) => {
                requestURI.push(element.localClaim.uri);
            });
        } else if (claimConfigurations?.dialect === "LOCAL") {
            claimConfigurations.requestedClaims.map((element: RequestedClaimConfigurationInterface) => {
                requestURI.push(element.claim.uri);
            });
        }
        return requestURI;
    });

    /**
     * Check whether claim is mandatory or not
     *
     * @param uri Claim URI to be checked.
     */
    const checkInitialRequestMandatory = (uri: string) => {
        let requestURI = false;
        // If custom mapping there then retrieve the relevant uri and check for requested section.
        if (claimConfigurations.dialect === "CUSTOM") {
            const requestURI = claimConfigurations.claimMappings.find(
                (mapping) => mapping?.localClaim?.uri === uri)?.applicationClaim;
            if (requestURI) {
                const checkInRequested = claimConfigurations.requestedClaims.find(
                    (requestClaims) => requestClaims?.claim?.uri === requestURI);
                if (checkInRequested) {
                    return checkInRequested.mandatory;
                }
            }
        }
        // If it is mapped directly check the requested section
        requestURI = claimConfigurations.requestedClaims.find(
            (requestClaims) => requestClaims?.claim?.uri === uri)?.mandatory;

        return requestURI;
    };

    /**
     * Check whether claim is requested or not.
     *
     * @param uri Claim URI to be checked.
     */
    const checkInitialRequested = (uri: string): boolean => {
        if (claimConfigurations.dialect === "CUSTOM") {
            const requestURI = claimConfigurations.claimMappings.find(
                (mapping) => mapping?.localClaim?.uri === uri)?.applicationClaim;
            let checkInRequested;
            if (requestURI) {
                checkInRequested = claimConfigurations.requestedClaims.find(
                    (requestClaims) => requestClaims?.claim?.uri === requestURI);
            } else {
                checkInRequested = claimConfigurations.requestedClaims.find(
                    (requestClaims) => requestClaims?.claim?.uri === uri);
            }

            return !!checkInRequested;
        } else {
            // If the dialect is not custom, the initial selected claim is decided by requested claims
            // So it is always true.
            return true;
        }
    };

    // search operation for claims
    const searchFilter = (changeValue) => {

        if (selectedDialect.localDialect) {
            setFilterSelectedClaims(selectedClaims.filter((item) =>
                item.displayName.toLowerCase().indexOf(changeValue.toLowerCase()) !== -1));
        } else {
            setFilterSelectedExternalClaims(selectedExternalClaims.filter((item) =>
                item.claimURI.toLowerCase().indexOf(changeValue.toLowerCase()) !== -1));
        }
    };

    /**
     * Handle change event of the search input.
     *
     * @param event change event.
     */
    const handleChange = (event) => {
        const changeValue = event.target.value;
        if (changeValue.length > 0) {
            // setSearchOn(true);
            searchFilter(changeValue);
        } else {
            // setSearchOn(false);
            if (selectedDialect.localDialect) {
                setFilterSelectedClaims(selectedClaims);
            } else {
                setFilterSelectedExternalClaims(selectedExternalClaims);
            }
        }
    };

    const setInitialValues = () => {
        // set local dialect values.
        if (selectedDialect.localDialect) {
            const initialRequest = getInitiallySelectedClaimsURI();
            const initialSelectedClaims: ExtendedClaimInterface[] = [];
            const initialAvailableClaims: ExtendedClaimInterface[] = [];
            claims.filter(claim => isIdentityClaim(claim) == false).map((claim) => {
                if (initialRequest.includes(claim.claimURI)) {
                    const newClaim: ExtendedClaimInterface = {
                        ...claim,
                        mandatory: checkInitialRequestMandatory(claim.claimURI),
                        requested: checkInitialRequested(claim.claimURI)
                    };
                    initialSelectedClaims.push(newClaim);
                } else {
                    initialAvailableClaims.push(claim);
                }
            });
            setSelectedClaims(initialSelectedClaims);
            setClaims(initialAvailableClaims);
            setAvailableClaims(initialAvailableClaims);

            //Handle claim mapping initialization
            if (claimConfigurations?.dialect === "CUSTOM") {
                const initialClaimMappingList: ExtendedClaimMappingInterface[] = [];
                claimConfigurations.claimMappings.map((claim) => {
                    const claimMapping: ExtendedClaimMappingInterface = {
                        addMapping: true,
                        applicationClaim: claim.applicationClaim,
                        localClaim: {
                            displayName: claim?.localClaim?.displayName,
                            id: claim?.localClaim?.id,
                            uri: claim?.localClaim?.uri
                        }
                    };
                    initialClaimMappingList.push(claimMapping);
                });
                setClaimMapping(initialClaimMappingList);
            } else {
                const initialClaimMappingList: ExtendedClaimMappingInterface[] = [];
                initialSelectedClaims.map((claim: ExtendedClaimInterface) => {
                    // createMapping(claim);
                    const claimMapping: ExtendedClaimMappingInterface = {
                        addMapping: false,
                        applicationClaim: "",
                        localClaim: {
                            displayName: claim.displayName,
                            id: claim.id,
                            uri: claim.claimURI
                        }
                    };
                    initialClaimMappingList.push(claimMapping);
                });
                setClaimMapping(initialClaimMappingList);
            }
            setInitializationFinished(true);
        } else {
            const initialRequest = getInitiallySelectedClaimsURI();
            const initialSelectedClaims: ExtendedExternalClaimInterface[] = [];
            const initialAvailableClaims: ExtendedExternalClaimInterface[] = [];
            externalClaims.filter(claim => isIdentityClaim(claim) == false).map((claim) => {
                if (initialRequest.includes(claim.mappedLocalClaimURI)) {
                    const newClaim: ExtendedExternalClaimInterface = {
                        ...claim,
                        mandatory: checkInitialRequestMandatory(claim.mappedLocalClaimURI),
                        requested: true
                    };
                    initialSelectedClaims.push(newClaim);

                } else {
                    initialAvailableClaims.push(claim);
                }
            });
            setSelectedExternalClaims(initialSelectedClaims);
            setExternalClaims(initialAvailableClaims);
            setAvailableExternalClaims(initialAvailableClaims);
            setInitializationFinished(true);
        }
    };

    const handleOpenSelectionModal = () => {
        setShowSelectionModal(true);
    };

    useEffect(() => {
        if (claims) {
            setAvailableClaims([...claims.filter(claim => isIdentityClaim(claim) == false)]);
        }
        if (externalClaims) {
            setAvailableExternalClaims([...externalClaims.filter(claim => isIdentityClaim(claim) == false)]);
        }
    }, [claims, externalClaims]);


    useEffect(() => {
        if (selectedClaims) {
            setFilterSelectedClaims([...selectedClaims]);
        }
        if (selectedExternalClaims) {
            setFilterSelectedExternalClaims([...selectedExternalClaims]);
        }
    }, [selectedClaims, selectedExternalClaims]);

    useEffect(() => {
        if (!initValue.current) {
            setInitializationFinished(false);
            setInitialValues();
            initValue.current = true;
        }
    }, [claimConfigurations]);

    const addSelectionModal = (() => {
            if (selectedDialect.localDialect) {
                return (
                    <AttributeSelectionWizard
                        selectedClaims={ selectedClaims }
                        setSelectedClaims={ setFilterSelectedClaims }
                        setInitialSelectedClaims={ setSelectedClaims }
                        showAddModal={ showSelectionModal }
                        setShowAddModal={ setShowSelectionModal }
                        availableClaims={ claims.filter(claim => isIdentityClaim(claim) == false) }
                        setAvailableClaims={ setClaims }
                        createMapping={ createMapping }
                        removeMapping={ removeMapping }
                        data-testid={ `${ testId }-wizard` }
                    />
                );
            }
            return (

                <AttributeSelectionWizardOtherDialect
                    selectedExternalClaims={ selectedExternalClaims }
                    setSelectedExternalClaims={ setFilterSelectedExternalClaims }
                    setInitialSelectedExternalClaims={ setSelectedExternalClaims }
                    showAddModal={ showSelectionModal }
                    setShowAddModal={ setShowSelectionModal }
                    availableExternalClaims={ externalClaims.filter(claim => isIdentityClaim(claim) == false) }
                    setAvailableExternalClaims={ setExternalClaims }
                    data-testid={ `${ testId }-wizard-other-dialects` }
                />
            );
        }
    );

    const deleteAttribute = (claimURI: string): void => {
        const removing = selectedExternalClaims.find(claim => claim.mappedLocalClaimURI === claimURI);
        setSelectedExternalClaims(selectedExternalClaims.filter(claim => claim.mappedLocalClaimURI !== claimURI));
        setFilterSelectedExternalClaims(filterSelectedExternalClaims
            .filter(claim => claim.mappedLocalClaimURI !== claimURI));
        const externalClaim = externalClaims.find(claim => claim.mappedLocalClaimURI === claimURI);
        if(!externalClaim){
            setExternalClaims([removing , ...externalClaims]);
        }
    };

    const onDeleteAttribute = (claimURI: string): void => {
        if(selectedSubjectValue === claimURI && defaultSubjectAttribute !== claimURI) {
            setShowDeleteConfirmationModal(true);
        } else {
            deleteAttribute(claimURI);
        }
    };

    const removeAttributeModal = () => {
        const defaultSubjectClaim = claims.find(claim => claim.claimURI === defaultSubjectAttribute);

        return (
            <ConfirmationModal
                onClose={ (): void => setShowDeleteConfirmationModal(false) }
                type="warning"
                open={ showDeleteConfirmationModal }
                primaryAction={ t("common:confirm") }
                secondaryAction={ t("common:cancel") }
                onSecondaryActionClick={ (): void => {
                    setShowDeleteConfirmationModal(false);
                } }
                onPrimaryActionClick={ () => {
                    deleteAttribute(selectedSubjectValue);
                    setShowDeleteConfirmationModal(false);
                } }
                data-testid={ `${ testId }-delete-confirmation-modal` }
                closeOnDimmerClick={ false }
            >
                <ConfirmationModal.Header
                    data-testid={ `${ testId }-delete-confirmation-modal-header` }
                >
                    { t("console:develop.features.applications.confirmations.removeApplicationUserAttribute" +
                        ".header") }
                </ConfirmationModal.Header>
                <ConfirmationModal.Message
                    attached
                    warning
                    data-testid={ `${ testId }-delete-confirmation-modal-message` }
                >
                    { t("console:develop.features.applications.confirmations.removeApplicationUserAttribute." +
                        "subHeader") }
                </ConfirmationModal.Message>
                <ConfirmationModal.Content
                    data-testid={ `${ testId }-delete-confirmation-modal-content` }
                >
                    <Trans
                        i18nKey={ "console:develop.features.applications.confirmations." +
                        "removeApplicationUserAttribute.content" }
                    >
                        If you remove this, the subject attribute will be set to
                        the <strong>{ { default: defaultSubjectClaim.displayName } }</strong>
                    </Trans>
                </ConfirmationModal.Content>
            </ConfirmationModal>
        );
    };

    return (
        claimConfigurations && initializationFinished
            ?
            <>
                <Grid.Row data-testid={ testId }>
                    <Grid.Column computer={ 16 } tablet={ 16 } largeScreen={ 12 } widescreen={ 12 } >
                        <Heading as="h4">
                            { t("console:develop.features.applications.edit.sections.attributes.selection.heading") }
                        </Heading>
                        {
                            (selectedClaims.length > 0 || selectedExternalClaims.length > 0) ? (
                                <>
                                    <Grid.Row className="user-role-edit-header-segment clearing attributes">
                                        <Table
                                            data-testid={ `${ testId }-action-bar` }
                                            basic="very"
                                            compact
                                        >
                                            <Table.Body>
                                                <Table.Row>
                                                    <Table.Cell collapsing width="6">
                                                        <Input
                                                            icon={ <Icon name="search"/> }
                                                            iconPosition="left"
                                                            onChange={ handleChange }
                                                            placeholder={
                                                                t("console:develop.features.applications.edit" +
                                                                    ".sections.attributes.selection.mappingTable" +
                                                                    ".searchPlaceholder")
                                                            }
                                                            floated="left"
                                                            size="small"
                                                            data-testid={ `${ testId }-search` }
                                                        />
                                                    </Table.Cell>
                                                    { selectedDialect.localDialect &&
                                                    (
                                                        <Table.Cell textAlign="right">
                                                            <Checkbox
                                                                slider
                                                                checked={ claimMappingOn }
                                                                onChange={ () => {
                                                                    if (!claimMappingOn) {
                                                                        setClaimMappingOn(true);
                                                                    } else if (isDefaultMappingChanged) {
                                                                        showClaimMappingRevertConfirmation(true);
                                                                    } else {
                                                                        setClaimMappingOn(false);
                                                                    }
                                                                } }
                                                                label={
                                                                    t("console:develop.features.applications" +
                                                                        ".edit.sections.attributes.selection" +
                                                                        ".mappingTable.actions.enable")
                                                                }
                                                                readOnly={ readOnly }
                                                                data-testid={ `${ testId }-cliam-mapping-toggle` }
                                                            />
                                                        </Table.Cell>
                                                    )
                                                    }
                                                    {
                                                        !readOnly && (
                                                            <Table.Cell textAlign="right">
                                                                <Button
                                                                    size="medium"
                                                                    icon="pencil"
                                                                    floated="right"
                                                                    onClick={ handleOpenSelectionModal }
                                                                    data-testid={ `${ testId }-update-button` }
                                                                />
                                                            </Table.Cell>
                                                        )
                                                    }
                                                </Table.Row>
                                            </Table.Body>
                                        </Table>
                                    </Grid.Row>
                                    <Segment className="user-role-edit-header-segment attributes">
                                        <Grid.Row>
                                            { selectedDialect.localDialect
                                                ? (
                                                    <Table
                                                        singleLine
                                                        compact
                                                        data-testid={ `${ testId }-list` }
                                                        fixed
                                                    >
                                                        <Table.Header>
                                                            { claimMappingOn
                                                                ? (
                                                                    <Table.Row>
                                                                        <Table.HeaderCell width="6">
                                                                            <strong>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mappingTable.columns" +
                                                                                        ".attribute")
                                                                                }
                                                                            </strong>
                                                                        </Table.HeaderCell>
                                                                        <Table.HeaderCell width="8">
                                                                            <strong>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mappingTable.columns" +
                                                                                        ".appAttribute")
                                                                                }
                                                                            </strong>
                                                                            <Hint icon="info circle" popup>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mappingTable.mappedAtributeHint" )
                                                                                }
                                                                            </Hint>
                                                                        </Table.HeaderCell>
                                                                        <Table.HeaderCell>
                                                                            <strong>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mappingTable.columns" +
                                                                                        ".mandatory")
                                                                                }
                                                                            </strong>
                                                                            <Hint icon="help circle" popup>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mandatoryAttributeHint")
                                                                                }
                                                                            </Hint>
                                                                        </Table.HeaderCell>
                                                                    </Table.Row>
                                                                )
                                                                :
                                                                (
                                                                    <Table.Row>
                                                                        <Table.HeaderCell>
                                                                            <strong>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mappingTable.columns" +
                                                                                        ".attribute")
                                                                                }
                                                                            </strong>
                                                                        </Table.HeaderCell>
                                                                        <Table.HeaderCell textAlign="center">
                                                                            <strong>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mappingTable.columns" +
                                                                                        ".mandatory")
                                                                                }
                                                                            </strong>
                                                                            <Hint icon="help circle" popup>
                                                                                {
                                                                                    t("console:develop.features" +
                                                                                        ".applications.edit.sections" +
                                                                                        ".attributes.selection" +
                                                                                        ".mandatoryAttributeHint")
                                                                                }
                                                                            </Hint>
                                                                        </Table.HeaderCell>
                                                                    </Table.Row>
                                                                )
                                                            }
                                                        </Table.Header>
                                                        <Table.Body>
                                                            {
                                                                filterSelectedClaims?.map((claim) => {
                                                                    return (
                                                                        <AttributeListItem
                                                                            key={ claim.id }
                                                                            claimURI={ claim.claimURI }
                                                                            displayName={ claim.displayName }
                                                                            mappedURI={ claim.claimURI }
                                                                            localDialect={ true }
                                                                            updateMapping={ updateClaimMapping }
                                                                            addToMapping={ addToClaimMapping }
                                                                            mapping={
                                                                                getCurrentMapping(claim.claimURI)
                                                                            }
                                                                            isDefaultMappingChanged={
                                                                                setIsDefaultMappingChanged
                                                                            }
                                                                            initialMandatory={
                                                                                (claimConfigurations?.subject?.claim?.uri
                                                                                    === claim.claimURI)
                                                                                    ? true
                                                                                    : claim.mandatory
                                                                            }
                                                                            initialRequested={ claim.requested }
                                                                            selectMandatory={ updateMandatory }
                                                                            selectRequested={ updateRequested }
                                                                            claimMappingOn={ claimMappingOn }
                                                                            claimMappingError={ claimMappingError }
                                                                            readOnly={
                                                                                (claimConfigurations?.subject?.claim?.uri
                                                                                    === claim.claimURI)
                                                                                    ? true
                                                                                    : readOnly
                                                                            }
                                                                            data-testid={ claim.claimURI }
                                                                        />
                                                                    );

                                                                })
                                                            }
                                                        </Table.Body>
                                                    </Table>
                                                )
                                                :
                                                (
                                                    <Table
                                                        singleLine
                                                        compact
                                                        data-testid={ `${ testId }-list` }
                                                        fixed
                                                    >
                                                        <Table.Header>
                                                            <Table.Row>
                                                                <Table.HeaderCell width="10">
                                                                    <strong>
                                                                        {
                                                                            t("console:develop.features" +
                                                                                ".applications.edit.sections" +
                                                                                ".attributes.selection" +
                                                                                ".mappingTable.columns" +
                                                                                ".attribute")
                                                                        }
                                                                    </strong>
                                                                </Table.HeaderCell>
                                                                <Table.HeaderCell textAlign="center" width="8">
                                                                    <strong>
                                                                        {
                                                                            t("console:develop.features" +
                                                                                ".applications.edit.sections" +
                                                                                ".attributes.selection" +
                                                                                ".mappingTable.columns" +
                                                                                ".mandatory")
                                                                        }
                                                                    </strong>
                                                                    <Hint icon="info circle" popup>
                                                                        {
                                                                            t("console:develop.features" +
                                                                                ".applications.edit.sections" +
                                                                                ".attributes.selection" +
                                                                                ".mandatoryAttributeHint")
                                                                        }
                                                                    </Hint>
                                                                </Table.HeaderCell>
                                                                <Table.HeaderCell width="2"></Table.HeaderCell>
                                                            </Table.Row>
                                                        </Table.Header>
                                                        <Table.Body>
                                                            {
                                                                filterSelectedExternalClaims?.map((claim) => {
                                                                    return (
                                                                        <AttributeListItem
                                                                            key={ claim.id }
                                                                            claimURI={ claim.claimURI }
                                                                            displayName={ claim.claimURI }
                                                                            mappedURI={ claim.mappedLocalClaimURI }
                                                                            localDialect={ false }
                                                                            initialMandatory={
                                                                                (selectedSubjectValue
                                                                                    === claim.mappedLocalClaimURI)
                                                                                    ? true
                                                                                    : claim.mandatory
                                                                            }
                                                                            selectMandatory={ updateMandatory }
                                                                            initialRequested={ claim.requested }
                                                                            data-testid={ claim.claimURI }
                                                                            readOnly={
                                                                                (selectedSubjectValue
                                                                                    === claim.mappedLocalClaimURI)
                                                                                    ? true
                                                                                    : readOnly
                                                                            }
                                                                            localClaimDisplayName={
                                                                                claim.localClaimDisplayName
                                                                            }
                                                                            deleteAttribute={
                                                                                () => onDeleteAttribute(
                                                                                    claim.mappedLocalClaimURI)
                                                                            }
                                                                            subject={ selectedSubjectValue
                                                                            === claim.mappedLocalClaimURI }
                                                                        />
                                                                    );
                                                                })
                                                            }
                                                        </Table.Body>
                                                    </Table>
                                                )
                                            }
                                        </Grid.Row>
                                    </Segment>
                                </>
                            ) : (
                                <Segment>
                                    <EmptyPlaceholder
                                        subtitle={ [
                                            t("console:develop.features.applications.placeholders.emptyAttributesList" +
                                                ".subtitles")
                                        ] }
                                        action={
                                            !readOnly && (
                                                <PrimaryButton onClick={ handleOpenSelectionModal }>
                                                    <Icon name="plus"/>
                                                    { t("console:develop.features.applications.placeholders" +
                                                        ".emptyAttributesList.action") }
                                                </PrimaryButton>
                                            )
                                        }
                                        image={ getEmptyPlaceholderIllustrations().emptyList }
                                        imageSize="tiny"
                                        data-testid={ `${ testId }-empty-placeholder` }
                                    />
                                </Segment>
                            )
                        }
                        { (selectedDialect.id === ClaimManagementConstants.ATTRIBUTE_DIALECT_IDS.get("OIDC")) ?
                            (
                                <Hint>
                                    <Trans
                                        i18nKey={ "console:develop.features.applications.edit.sections.attributes." +
                                        "selection.attributeComponentHint" }
                                    >
                                        Manage the user attributes you want to share with this application via
                                        <a href="javascript:void()" onClick={ () => {
                                            history.push(
                                                AppConstants.getPaths().get("OIDC_SCOPES")
                                            );
                                        } }>OpenID Connect Scopes.</a>
                                        You can map additional attributes under
                                        <a
                                            href="javascript:void()"
                                            onClick={ () => {
                                                history.push(
                                                    AppConstants.getPaths()
                                                        .get("ATTRIBUTE_MAPPINGS")
                                                        .replace(":type", ClaimManagementConstants.OIDC)
                                                );
                                            } }>attribute mappings.</a>
                                    </Trans>
                                </Hint>
                            ) : (
                                <Hint>
                                    {
                                        t("console:develop.features.applications.edit.sections.attributes." +
                                            "selection.attributeComponentHint")
                                    }
                                </Hint>
                            )
                        }
                    </Grid.Column>
                </Grid.Row>
                { addSelectionModal() }
                { removeAttributeModal() }
            </>
            : !initializationFinished
            ? <ContentLoader/>
            : null
    );
};

/**
 * Default props for the application attribute selection component.
 */
AttributeSelection.defaultProps = {
    "data-testid": "application-attribute-selection"
};
