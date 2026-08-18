$(document).ready(function () {
    const STORAGE_KEY = 'gt_saved_innovations';
    const allInnovations = $('.innovation-item');
    const totalInnovations = allInnovations.length;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeFilter = 'all';

    function loadSavedInnovations() {
        try {
            const storedValue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (!Array.isArray(storedValue)) return [];
            return storedValue.filter(function (key) {
                return typeof key === 'string' && $('.innovation-item[data-innovation="' + key + '"]').length;
            });
        } catch (error) {
            return [];
        }
    }

    let savedInnovations = loadSavedInnovations();

    function storeSavedInnovations() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedInnovations));
        } catch (error) {
            $('#filter-status').text('Saved innovations are unavailable in this browser.');
        }
    }

    function updateSavedInterface() {
        $('.saved-count').text(savedInnovations.length);

        $('.save-innovation-btn').each(function () {
            const button = $(this);
            const key = button.data('innovation');
            const title = button.closest('.innovation-card').find('h3').first().text();
            const isSaved = savedInnovations.includes(key);

            button
                .toggleClass('is-saved', isSaved)
                .attr('aria-pressed', String(isSaved))
                .attr('aria-label', isSaved ? 'Remove ' + title + ' from saved innovations' : 'Save ' + title);
            button.find('i').attr('class', isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark');
        });
    }

    function applyFilter(filter, filterButton) {
        activeFilter = filter;
        let visibleItems;

        if (filter === 'all') {
            visibleItems = allInnovations;
        } else if (filter === 'saved') {
            visibleItems = allInnovations.filter(function () {
                return savedInnovations.includes($(this).data('innovation'));
            });
        } else {
            visibleItems = allInnovations.filter('[data-category="' + filter + '"]');
        }

        $('.filter-btn').removeClass('active').attr('aria-pressed', 'false');
        $(filterButton || '.filter-btn[data-filter="' + filter + '"]').addClass('active').attr('aria-pressed', 'true');

        allInnovations.stop(true, true).hide();
        if (prefersReducedMotion) {
            visibleItems.show();
        } else {
            visibleItems.fadeIn(240);
        }

        if (filter === 'saved' && visibleItems.length === 0) {
            $('#filter-status').text('No saved innovations yet. Use the bookmark button on any card to save it.');
        } else if (filter === 'all') {
            $('#filter-status').text('Showing all ' + totalInnovations + ' innovations');
        } else {
            const filterName = filter === 'saved' ? 'saved' : $(filterButton || '.filter-btn[data-filter="' + filter + '"]').clone().children().remove().end().text().trim().toLowerCase();
            $('#filter-status').text('Showing ' + visibleItems.length + ' ' + filterName + ' innovation' + (visibleItems.length === 1 ? '' : 's'));
        }
    }

    $('.filter-btn').on('click', function () {
        applyFilter($(this).data('filter'), this);
    });

    $('.save-innovation-btn').on('click', function () {
        const key = $(this).data('innovation');
        const existingIndex = savedInnovations.indexOf(key);

        if (existingIndex === -1) {
            savedInnovations.push(key);
        } else {
            savedInnovations.splice(existingIndex, 1);
        }

        storeSavedInnovations();
        updateSavedInterface();

        if (activeFilter === 'saved') {
            applyFilter('saved', $('.filter-btn[data-filter="saved"]').get(0));
        } else {
            const action = existingIndex === -1 ? 'Saved ' : 'Removed ';
            $('#filter-status').text(action + $(this).closest('.innovation-card').find('h3').first().text() + '.');
        }
    });

    updateSavedInterface();

    const innovationDetails = {
        solar: {
            title: 'Solar microgrids',
            icon: 'fa-solar-panel',
            steps: [
                'Solar panels generate electricity from sunlight.',
                'A controller supplies campus loads and sends surplus electricity to batteries.',
                'Stored electricity supports essential loads when solar output falls or the main grid is interrupted.'
            ],
            benefit: 'Provides cleaner, local and more resilient electricity for essential services.',
            limitation: 'Requires high initial investment, careful system design and ongoing battery maintenance.',
            application: 'Libraries, laboratories, community halls and outdoor charging stations.',
            sources: [
                { label: 'Read official explanation — US Department of Energy', url: 'https://www.energy.gov/cmei/systems/solar-integration-distributed-energy-resources-and-microgrids-basics' },
                { label: 'Malaysian context — SEDA Malaysia Solar Photovoltaic', url: 'https://www.seda.gov.my/reportal/fit/eligible-renewable-resources/solar-photovoltaic/' }
            ]
        },
        storage: {
            title: 'Smart energy storage',
            icon: 'fa-battery-three-quarters',
            steps: [
                'Solar panels or the grid supply electricity when production is high or demand is low.',
                'A battery management system monitors charge, temperature and safety while energy is stored.',
                'The batteries release electricity when demand rises, renewable production falls or backup power is needed.'
            ],
            benefit: 'Balances supply and demand while making renewable electricity available at a more useful time.',
            limitation: 'Battery cost, ageing, temperature control and responsible end-of-life handling must be planned.',
            application: 'Renewable-energy demonstrations, electric mobility hubs and critical campus buildings.',
            sources: [
                { label: 'Read official explanation — US Department of Energy', url: 'https://www.energy.gov/cmei/systems/solar-integration-solar-energy-and-storage-basics' }
            ]
        },
        water: {
            title: 'Smart water monitoring',
            icon: 'fa-faucet-drip',
            steps: [
                'Flow meters and moisture sensors collect water-use information at important points.',
                'A dashboard compares normal patterns with unusual flow, including night-time or weekend use.',
                'Facility teams inspect the affected zone and repair leaks before more water or property is damaged.'
            ],
            benefit: 'Helps find irregular water use earlier and supports evidence-based maintenance.',
            limitation: 'Sensors require suitable placement, stable connectivity, calibration and regular maintenance.',
            application: 'Hostels, washrooms, laboratories, gardens and campus kitchens.',
            sources: [
                { label: 'Read official explanation — US EPA WaterSense', url: 'https://www.epa.gov/watersense/leak-detection-and-flow-monitoring-devices' }
            ]
        },
        digestion: {
            title: 'Food-waste anaerobic digestion',
            icon: 'fa-recycle',
            steps: [
                'Food waste is separated from plastics and other unsuitable materials.',
                'Microorganisms break down the organic material inside a sealed reactor without oxygen.',
                'The process produces biogas for energy and digestate that may be treated for beneficial use.'
            ],
            benefit: 'Recovers useful energy and material from separated food waste instead of treating it only as rubbish.',
            limitation: 'Contamination, odour, feedstock consistency and operating conditions require close management.',
            application: 'Cafeterias, residential colleges, food courts and teaching farms with a reliable food-waste supply.',
            sources: [
                { label: 'Read official explanation — US EPA AgSTAR', url: 'https://www.epa.gov/agstar/how-does-anaerobic-digestion-work' }
            ]
        },
        greenhouse: {
            title: 'Precision greenhouses',
            icon: 'fa-wheat-awn',
            steps: [
                'Sensors measure conditions such as moisture, temperature, humidity and light.',
                'A control system compares the readings with the needs of the crop.',
                'Irrigation, ventilation or lighting is adjusted so resources are used only when needed.'
            ],
            benefit: 'Creates more consistent growing conditions while improving control over water and other inputs.',
            limitation: 'Equipment, energy use and technical maintenance can make the system expensive or complex.',
            application: 'Teaching farms, urban gardens, research plots and campus food-security projects.',
            sources: [
                { label: 'Read official explanation — USDA NIFA', url: 'https://training-portal.nifa.usda.gov/web/crisprojectpages/7003352-controlled-environment-technology-and-use.html' }
            ]
        },
        nature: {
            title: 'Nature-based design',
            icon: 'fa-tree-city',
            steps: [
                'Planners identify heat, runoff or biodiversity problems within the built environment.',
                'Green roofs, rain gardens, shade trees or planted drainage areas are matched to the site.',
                'Plants and soil provide cooling, absorb rainwater and create habitat as part of daily infrastructure.'
            ],
            benefit: 'Can combine cooling, stormwater control, habitat and more comfortable public spaces in one design.',
            limitation: 'Plant selection, structural capacity, water needs and long-term upkeep must suit the site.',
            application: 'Courtyards, roofs, car parks, pedestrian routes and flood-prone campus areas.',
            sources: [
                { label: 'Read official explanation — US EPA Green Infrastructure', url: 'https://www.epa.gov/green-infrastructure/types-green-infrastructure' }
            ]
        }
    };

    $('#innovationModal').on('show.bs.modal', function (event) {
        const innovationKey = $(event.relatedTarget).data('innovation');
        const details = innovationDetails[innovationKey];
        if (!details) return;

        $('#innovationModalTitle').text(details.title);
        $('#modal-icon').attr('class', 'fa-solid ' + details.icon);
        $('#modal-benefit').text(details.benefit);
        $('#modal-limitation').text(details.limitation);
        $('#modal-application').text(details.application);

        const stepsList = $('#modal-steps').empty();
        details.steps.forEach(function (step) {
            $('<li>').text(step).appendTo(stepsList);
        });

        const sourcesList = $('#modal-sources').empty();
        details.sources.forEach(function (source) {
            $('<a>', {
                class: 'btn btn-sm btn-outline-success',
                href: source.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                text: source.label
            }).append($('<i>', { class: 'fa-solid fa-arrow-up-right-from-square' })).appendTo(sourcesList);
        });
    });

    const recommendations = {
        energy: {
            icon: 'fa-solar-panel',
            title: 'Solar microgrid pilot',
            description: "Measure one building's daily demand, then size a small solar and battery demonstration around its essential loads.",
            action: 'Review three months of electricity bills and identify peak-use periods.',
            innovation: 'solar',
            filter: 'energy'
        },
        storage: {
            icon: 'fa-battery-three-quarters',
            title: 'Smart energy storage pilot',
            description: 'Store renewable electricity when generation is high, then release it when campus demand is higher.',
            action: 'Compare electricity demand with solar-generation hours.',
            innovation: 'storage',
            filter: 'energy'
        },
        water: {
            icon: 'fa-faucet-drip',
            title: 'Smart leak-detection zone',
            description: 'Install flow monitoring at one high-use building to flag unusual night-time or weekend consumption.',
            action: 'Record the current meter reading at the same time each day for one week.',
            innovation: 'water',
            filter: 'resources'
        },
        waste: {
            icon: 'fa-recycle',
            title: 'Food-waste digestion pilot',
            description: 'Separate food waste from one cafeteria and assess whether a small anaerobic digestion demonstration is practical.',
            action: 'Measure the quantity and contamination of cafeteria food waste for one week.',
            innovation: 'digestion',
            filter: 'resources'
        },
        food: {
            icon: 'fa-wheat-awn',
            title: 'Sensor-guided garden',
            description: 'Use soil-moisture sensing and timed irrigation to improve consistency while avoiding unnecessary watering.',
            action: 'Map the garden zones and note which plants have similar water needs.',
            innovation: 'greenhouse',
            filter: 'agriculture'
        },
        heat: {
            icon: 'fa-tree-city',
            title: 'Cool-route demonstration',
            description: 'Combine shade trees, reflective surfaces and seating along one busy pedestrian route.',
            action: 'Measure surface temperature and shade coverage at midday in three locations.',
            innovation: 'nature',
            filter: 'built'
        }
    };

    let selectedChallenge = $('#challenge-select').val();

    $('#challenge-select').on('change', function () {
        selectedChallenge = $(this).val();
        const choice = recommendations[selectedChallenge];
        $('#match-icon').attr('class', 'fa-solid ' + choice.icon);
        $('#match-title').text(choice.title);
        $('#match-description').text(choice.description);
        $('#match-action').html('<strong>First action:</strong> ' + choice.action);
    });

    $('#view-innovation-btn').on('click', function () {
        const choice = recommendations[selectedChallenge];
        const filterButton = $('.filter-btn[data-filter="' + choice.filter + '"]');
        const innovationItem = $('.innovation-item[data-innovation="' + choice.innovation + '"]');

        filterButton.trigger('click');
        $('.innovation-item').removeClass('matcher-highlight');
        innovationItem.addClass('matcher-highlight');

        if (prefersReducedMotion) {
            window.scrollTo(0, innovationItem.offset().top - 110);
        } else {
            $('html, body').stop(true).animate({
                scrollTop: innovationItem.offset().top - 110
            }, 550);
        }

        window.setTimeout(function () {
            const detailsButton = innovationItem.find('.details-btn').get(0);
            if (detailsButton) detailsButton.click();
        }, prefersReducedMotion ? 0 : 600);

        window.setTimeout(function () {
            innovationItem.removeClass('matcher-highlight');
        }, 3000);
    });
});
