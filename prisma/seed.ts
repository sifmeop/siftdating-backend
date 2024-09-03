import { faker } from '@faker-js/faker'
import { Gender, Prisma, PrismaClient, RegistrationStage } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
  const seeds: Prisma.UserCreateInput[] = [...Array(10).keys()].map((i) => ({
    telegramId: faker.number.int({ min: 1000000, max: 9999999 }),
    firstName: faker.person.firstName(),
    photoKeys: ['files-1'],
    registrationStage: RegistrationStage.DONE,
    birthDate: faker.date.birthdate({ min: 18, mode: 'age' }),
    aboutMe: faker.lorem.paragraph(),
    city: faker.location.city(),
    gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
    isBot: true
  }))

  await prisma.user.createMany({ data: seeds })
}

main()
  .then(async () => {
    console.log('Seeded successfully')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
