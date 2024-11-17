export interface DeviceStateValue<T> {
    value?: T;
    updatedAt: Date
}

export interface DeviceResponseStateModel {
    on?: DeviceStateValue<boolean>,
    v?: DeviceStateValue<number>,
    s?: DeviceStateValue<number>,
    h?: DeviceStateValue<number>,
    program?: DeviceStateValue<string>,
}

export interface DeviceConfigModel {
    sn?: string,
    fwVer?: string,
    fwId?: string,
    mac?: string,
    deviceId?: string,
    app?: string,
    assignedToUser?: number,
    sgtin?: string,
}

export interface DeviceTagsModel {
    deviceTypeId?: number,
    deviceManufacturer?: string,
    customDeviceName?: string,
    deviceTypeURN?: string,
}

export interface DeviceResponseModel {
    tags?: DeviceTagsModel,
    states?: DeviceResponseStateModel,
    config?: DeviceConfigModel,
    connected?: DeviceStateValue<boolean>,
}

export type DevicesResponse = Record<string, DeviceResponseModel>;

export interface DeviceRequestStateModel {
    on?: boolean,
    v?: number,
    s?: number,
    h?: number,
    program?: string,
    pattern?: string,
    playing?: boolean,
}

export interface DeviceRequestModel {
    states?: DeviceRequestStateModel,
}

export type DevicesRequest = Record<string, DeviceRequestModel>;