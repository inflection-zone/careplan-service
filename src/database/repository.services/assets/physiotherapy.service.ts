import {
    PhysiotherapyModel
} from '../../models/assets/physiotherapy.model';
import {
    UserModel
} from '../../models/user/user.model';

import {
    ErrorHandler
} from '../../../common/error.handler';
import {
    PhysiotherapyCreateModel,
    PhysiotherapySearchFilters,
    PhysiotherapySearchResults
} from '../../../domain.types/assets/physiotherapy.domain.types';
import {
    Op
} from 'sequelize';
import { Helper } from '../../../common/helper';

///////////////////////////////////////////////////////////////////////////////////////////////

export class PhysiotherapyService {

    //#region Models

    Physiotherapy = PhysiotherapyModel.Model;

    User = UserModel.Model;

    //#endregion

    //#region Publics

    create = async (createModel: PhysiotherapyCreateModel) => {
        try {
            if (!createModel.AssetCode) {
                const count = await this.Physiotherapy.count();
                createModel.AssetCode = 'Physiotherapy-' + count.toString();
                const exists = await this.getByCode(createModel.AssetCode);
                if (exists) {
                    createModel.AssetCode = 'Physiotherapy-' + Helper.generateDisplayId();
                }
            }
            var record = await this.Physiotherapy.create(createModel);
            return await this.getById(record.id);
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to create physiotherapy!', error);
        }
    }

    getById = async (id) => {
        try {
            const record = await this.Physiotherapy.findOne({
                where : {
                    id : id
                }
            });
            return record;
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve physiotherapy!', error);
        }
    }

    getByCode = async (code) => {
        try {
            const record = await this.Physiotherapy.findOne({
                where : {
                    AssetCode : code
                }
            });
            return record;
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to retrieve action plan!', error);
        }
    }

    exists = async (id): Promise < boolean > => {
        try {
            const record = await this.Physiotherapy.findByPk(id);
            return record !== null;
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to determine existance of physiotherapy!', error);
        }
    }

    search = async (filters: PhysiotherapySearchFilters): Promise < PhysiotherapySearchResults > => {
        try {

            var search = this.getSearchModel(filters);
            var {
                order,
                orderByColumn
            } = this.addSortingToSearch(search, filters);
            var {
                pageIndex,
                limit
            } = this.addPaginationToSearch(search, filters);

            const foundResults = await this.Physiotherapy.findAndCountAll(search);
            const searchResults: PhysiotherapySearchResults = {
                TotalCount     : foundResults.count,
                RetrievedCount : foundResults.rows.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : foundResults.rows,
            };

            return searchResults;

        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to search physiotherapy records!', error);
        }
    }

    update = async (id, updateModel) => {
        try {
            if (Object.keys(updateModel).length > 0) {
                var res = await this.Physiotherapy.update(updateModel, {
                    where : {
                        id : id
                    }
                });
                if (res.length !== 1) {
                    throw new Error('Unable to update physiotherapy!');
                }
            }
            return await this.getById(id);
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to update physiotherapy!', error);
        }
    }

    delete = async (id) => {
        try {
            var result = await this.Physiotherapy.destroy({
                where : {
                    id : id
                }
            });
            return result === 1;
        } catch (error) {
            ErrorHandler.throwDbAccessError('DB Error: Unable to delete physiotherapy!', error);
        }
    }

    //#endregion

    //#region Privates

    private getSearchModel = (filters) => {

        var search = {
            where   : {},
            include : []
        };

        if (filters.AssetCode) {
            search.where['AssetCode'] = {
                [Op.like] : '%' + filters.AssetCode + '%'
            };
        }
        if (filters.Name) {
            search.where['Name'] = {
                [Op.like] : '%' + filters.Name + '%'
            };
        }
        if (filters.Description) {
            search.where['Description'] = {
                [Op.like] : '%' + filters.Description + '%'
            };
        }
        if (filters.RecommendedDurationMin) {
            search.where['RecommendedDurationMin'] = filters.RecommendedDurationMin;
        }
        if (filters.AssetCategory) {
            search.where['AssetCategory'] = {
                [Op.like] : '%' + filters.AssetCategory + '%'
            };
        }
        if (filters.Tags) {
            search.where['Tags'] = {
                [Op.like] : '%' + filters.Tags + '%'
            };
        }
        if (filters.Version) {
            search.where['Version'] = {
                [Op.like] : '%' + filters.Version + '%'
            };
        }

        return search;
    }

    private addSortingToSearch = (search, filters) => {

        let orderByColumn = 'CreatedAt';
        if (filters.OrderBy) {
            orderByColumn = filters.OrderBy;
        }
        let order = 'ASC';
        if (filters.Order === 'descending') {
            order = 'DESC';
        }
        search['order'] = [
            [orderByColumn, order]
        ];

        if (filters.OrderBy) {
            //In case the 'order-by attribute' is on associated model
            //search['order'] = [[ '<AssociatedModel>', filters.OrderBy, order]];
        }
        return {
            order,
            orderByColumn
        };
    }

    private addPaginationToSearch = (search, filters) => {

        let limit = 25;
        if (filters.ItemsPerPage) {
            limit = filters.ItemsPerPage;
        }
        let offset = 0;
        let pageIndex = 0;
        if (filters.PageIndex) {
            pageIndex = filters.PageIndex < 0 ? 0 : filters.PageIndex;
            offset = pageIndex * limit;
        }
        search['limit'] = limit;
        search['offset'] = offset;

        return {
            pageIndex,
            limit
        };
    }

    //#endregion

}
