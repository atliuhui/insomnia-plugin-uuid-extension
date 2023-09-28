// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

const insomnia_plugin_uuid = require('insomnia-plugin-uuid').templateTags[0];
const _ = require('lodash');

module.exports.templateTags = [{
    name: 'uuidExt',
    displayName: 'UUID Extension',
    description: insomnia_plugin_uuid.description,
    args: insomnia_plugin_uuid.args.concat([
        {
            displayName: 'Expression',
            type: 'string',
            description: 'standard for expressions "func:arg1,arg2..." => "func(input,arg1,arg2...)"'
        }
    ]),
    async run(context, uuidType = 'v4', expression) {
        let input = await insomnia_plugin_uuid.run(context, uuidType);
        console.debug(input, expression);

        let config = parse(expression);
        console.debug(config);

        switch (config.func) {
            case "replace":
                return _.replace(input, config.args.at(0), config.args.at(1));
            case "replaceG":
                return _.replace(input, new RegExp(config.args.at(0), 'g'), config.args.at(1));
            case "replaceGI":
                return _.replace(input, new RegExp(config.args.at(0), 'gi'), config.args.at(1));
            default:
                return _.trim(input);
        }
    }
}];

function parse(filter) {
    let config = {
        func: null,
        args: []
    };

    if (!filter) {
        return config;
    }

    let func = _.first(_.split(filter, ':'));
    let args = _.trim(_.trimStart(_.replace(filter, func, ''), ':'));

    config.func = _.trim(func);
    if (args.length > 0) {
        config.args = _.map(_.split(args, ','), (item) => _.trim(item));
    }

    return config;
}
