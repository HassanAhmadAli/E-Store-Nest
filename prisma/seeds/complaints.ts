import { PrismaClient } from "@/prisma";
import { data as usersData } from "./user";
import { data as departmentsData } from "./department";
import { faker } from "@faker-js/faker";
import _ from "lodash";
const user = usersData.Citizen;
export const data = Array.from({ length: 10 }, (_, id) => {
    const department = departmentsData[id % departmentsData.length]!;
    return {
        id,
        title: faker.lorem.words(4),
        description: faker.lorem.words(26),
        citizenId: user.id,
        departmentId: department.id,
    };
});
export async function seedComplaints(prisma: PrismaClient) {
    await prisma.complaint.createMany({
        data: data,
    });
}
