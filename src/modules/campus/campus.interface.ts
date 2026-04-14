export interface ICreateCampusPayload {
    campusName: string;
    campusCode: string;
    address?: string;
    principal: {
        name: string;
        email: string;
        password: string;
    };
}
