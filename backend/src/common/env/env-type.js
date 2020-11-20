const EnvType = {
    PRODUCTION: "production",
    DEVELOPMENT: "development",
    LOCAL: "local",
    TEST: "test",
    values: () => Object.values(EnvType).filter((value) => typeof value === "string"),
    contains: (env) => EnvType.values().filter((value) => value === env).length !== 0
};

export { EnvType };
