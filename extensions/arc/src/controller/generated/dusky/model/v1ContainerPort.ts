/**
 * Dusky API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export class V1ContainerPort {
    'containerPort'?: number;
    'hostIP'?: string;
    'hostPort'?: number | null;
    'name'?: string;
    'protocol'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "containerPort",
            "baseName": "containerPort",
            "type": "number"
        },
        {
            "name": "hostIP",
            "baseName": "hostIP",
            "type": "string"
        },
        {
            "name": "hostPort",
            "baseName": "hostPort",
            "type": "number"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "protocol",
            "baseName": "protocol",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return V1ContainerPort.attributeTypeMap;
    }
}

