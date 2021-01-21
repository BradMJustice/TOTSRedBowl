export class RedBowlResponse {

    constructor(date: Date, firstname: string, lastname: string, email: string) {
        this.date = date;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
    }

    date: Date;
    firstname: string;
    lastname: string;
    email: string;
};