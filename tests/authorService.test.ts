import request from "supertest";
import Author from "../models/author";
import app from "../server";

describe("Verify GET /authors",()=>{
    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });
    let authors =     [
        'John Doe : 1958 - 2019',
        'Jane Doe : 1964 - 2019',
        'John Smith : 1989 - ',
        'Jane Smith : 1992 - '
      ]
    let expectedResponse =     [
        'John Doe : 1958 - 2019',
        'Jane Doe : 1964 - 2019',
        'John Smith : 1989 - ',
        'Jane Smith : 1992 - '
      ]

    it("should respond with a list of names and lifetimes sorted by family name of authors",async ()=>{
        let query = {family_name: 1}
        Author.getAllAuthors = jest.fn().mockImplementationOnce((query)=>{
            if(query.family_name === 1){
                return Promise.resolve(authors)
            }
            else{
                return Promise.resolve([])
            }
        });
        const response = await request(app).get('/authors')
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual(expectedResponse);
    })
    it("should respond with 'No authors found' message when there are no authors in the database",async ()=>{
        Author.getAllAuthors = jest.fn().mockResolvedValue([])
        const response = await request(app).get('/authors')
        expect(response.text).toBe('No authors found')
        expect(response.statusCode).toBe(200)
    })
    it("should respond with an error code of 500 if an error occurs when retrieving the authors",async ()=>{
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error("Database error"));
        const response = await request(app).get('/authors')
        expect(response.statusCode).toBe(500) 
        expect(consoleSpy).toHaveBeenCalled()
    })
})