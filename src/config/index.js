const roles = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    MT_ADMIN: 'MT_ADMIN',
    MT_USER: 'MT_USER',
    SERVICE_USER_1: 'SERVICE_USER_1',
    SERVICE_USER_2: 'SERVICE_USER_2',
    ACADEMIC_ADMIN: 'ACADEMIC_ADMIN',
    ACADEMIC_USER:'ACADEMIC_USER',
    TELECALL_USER: 'TELECALLER_USER',
    SALES_USER: 'SALES_USER'
  };

  const rolesArray = Object.values(roles);

module.exports ={
    roles,
    rolesArray
}
