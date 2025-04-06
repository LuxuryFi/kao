import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { BasePaginateResponse } from 'src/base/base-paginate.response';

export const ApiOkResponsePaginated = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(BasePaginateResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              docs: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
          { $ref: getSchemaPath(BasePaginateResponse) },
        ],
      },
    }),
  );
};
